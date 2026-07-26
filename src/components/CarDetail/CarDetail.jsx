// src/components/CarDetail/CarDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsPeopleFill, BsFuelPump } from 'react-icons/bs';
import { TbManualGearbox } from 'react-icons/tb';
import { FiMapPin, FiCalendar, FiArrowLeft, FiCheck, FiMaximize2, FiX, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthContext } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import { PageLoader } from '../ui/Loader';
import api from '../../services/api';
import { parseBookingDate, formatBookingDate } from '../../utils/dateUtils';
import { confirmAction } from '../../utils/alertUtils';
import './CarDetail.css';

registerLocale('es', es);

const CarDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pickupDate, setPickupDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);
    const [booking, setBooking] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const today = new Date();

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const { data } = await api.get(`/api/cars/${id}`);
                setCar(data);
            } catch {
                toast.error('Auto no encontrado');
                navigate('/autos');
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id, navigate]);

    const pricePerDayVal = car ? (car.price || car.pricePerDay || 0) : 0;
    const activeBookings = car?.activeBookings || [];

    // Calcular intervalos de fechas ya reservadas para bloquearlas en el calendario
    const excludeIntervals = activeBookings.map(b => ({
        start: parseBookingDate(b.pickUpDate),
        end: parseBookingDate(b.dropOffDate)
    }));

    const minReturnDate = pickupDate
        ? new Date(pickupDate.getTime() + 86400000)
        : new Date(today.getTime() + 86400000);

    const totalDays = () => {
        if (!pickupDate || !returnDate) return 0;
        const diff = returnDate.getTime() - pickupDate.getTime();
        return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
    };

    // Verificar si las fechas seleccionadas se superponen con alguna reserva activa
    const isDateOverlapping = () => {
        if (!pickupDate || !returnDate || activeBookings.length === 0) return false;
        return activeBookings.some(b => {
            const bStart = parseBookingDate(b.pickUpDate);
            const bEnd = parseBookingDate(b.dropOffDate);
            return pickupDate <= bEnd && returnDate >= bStart;
        });
    };

    const hasOverlap = isDateOverlapping();
    const totalPrice = totalDays() * pricePerDayVal;

    const handleBook = async () => {
        if (!user) return navigate('/login');
        if (!pickupDate || !returnDate) return toast.error('Seleccioná las fechas');
        if (returnDate <= pickupDate) return toast.error('El alquiler debe ser de al menos 1 día completo');
        if (hasOverlap) return toast.error('Las fechas seleccionadas se superponen con una reserva existente');

        const confirmed = await confirmAction({
            title: '¿Confirmar solicitud de reserva?',
            text: `Vas a solicitar el alquiler de ${car.name} por ${totalDays()} días ($${totalPrice.toLocaleString()}).`,
            confirmButtonText: 'Sí, enviar reserva',
            icon: 'question'
        });
        if (!confirmed) return;
        try {
            await api.post('/api/bookings', {
                carId: car._id || car.id,
                pickUpDate: format(pickupDate, 'yyyy-MM-dd'),
                dropOffDate: format(returnDate, 'yyyy-MM-dd'),
                location: car.location || '',
            });
            toast.success('¡Reserva enviada! El admin la revisará pronto.');
            navigate('/mireservas');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al reservar');
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <PageLoader text="Cargando detalles del auto..." />;
    if (!car) return null;

    const availableFrom = car.availableFrom
        ? format(new Date(car.availableFrom), "d 'de' MMMM 'de' yyyy", { locale: es })
        : null;

    return (
        <div className="cardetail-page page-container">
            <div className="container">

                {/* BOTÓN VOLVER */}
                <button className="cardetail-back btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Volver
                </button>

                <div className="cardetail-grid">
                    {/* IMAGEN PRINCIPAL CON ACCIÓN DE AMPLIAR (MODAL LIGHTBOX) */}
                    <div className="cardetail-img-container">
                        <div
                            className="cardetail-img-wrapper animate-fade-in"
                            onClick={() => setIsImageModalOpen(true)}
                            title="Haz clic para ver la imagen completa"
                        >
                            <img src={car.image} alt={car.name} className="cardetail-img" />
                            <div className="cardetail-img-overlay">
                                <span className="zoom-hint-badge"><FiMaximize2 /> Ver imagen completa</span>
                            </div>
                            <div className="cardetail-img-badge">
                                <Badge status={car.isAvailable ? 'available' : 'occupied'} />
                            </div>
                        </div>
                        <p className="cardetail-img-subtext">Haz clic sobre la imagen para ver el auto en tamaño completo</p>
                    </div>

                    {/* INFO + SECCIÓN DE FECHAS RESERVADAS + FORMULARIO DE RESERVA */}
                    <div className="cardetail-info animate-slide-up">
                        {/* Header */}
                        <div className="cardetail-header">
                            <div>
                                <p className="cardetail-type">{car.type} · {car.year}</p>
                                <h1 className="cardetail-name">{car.name}</h1>
                            </div>
                            <div className="cardetail-price-tag-single-line">
                                <span className="price-amount-inline">${pricePerDayVal.toLocaleString()}</span>
                                <span className="price-label-inline">/ día</span>
                            </div>
                        </div>

                        {/* SPECS */}
                        <div className="cardetail-specs">
                            <div className="car-spec">
                                <BsPeopleFill />
                                <span>{car.seats} asientos</span>
                            </div>
                            <div className="car-spec">
                                <BsFuelPump />
                                <span>{car.fuel}</span>
                            </div>
                            <div className="car-spec">
                                <TbManualGearbox />
                                <span>{car.transmission}</span>
                            </div>
                            <div className="car-spec">
                                <FiMapPin />
                                <span>{car.location}</span>
                            </div>
                        </div>

                        {/* SECCIÓN DE FECHAS YA RESERVADAS (BADGE/ALERTA EN COLOR ROJO) */}
                        {activeBookings.length > 0 && (
                            <div className="booked-dates-alert-box animate-fade-in">
                                <div className="booked-dates-title">
                                    <FiAlertTriangle className="alert-icon-red" />
                                    <strong>Fechas ya reservadas:</strong>
                                </div>
                                <div className="booked-dates-list">
                                    {activeBookings.map((b, idx) => (
                                        <div key={idx} className="booked-date-chip">
                                            <FiCalendar />
                                            <span>
                                                Del <strong>{formatBookingDate(b.pickUpDate, "dd/MM/yyyy")}</strong> al <strong>{formatBookingDate(b.dropOffDate, "dd/MM/yyyy")}</strong>
                                            </span>
                                            <span className="chip-badge-red">Reservado</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DESCRIPCIÓN */}
                        {car.description && (
                            <div className="cardetail-desc glass-card">
                                <p>{car.description}</p>
                            </div>
                        )}

                        {/* DISPONIBILIDAD DE DISPONIBLE DESDE */}
                        {!car.isAvailable && availableFrom && (
                            <div className="cardetail-unavail">
                                <FiCalendar />
                                <span>Este auto estará disponible desde <strong>{availableFrom}</strong></span>
                            </div>
                        )}

                        {/* FORMULARIO DE RESERVA */}
                        {car.isAvailable && (
                            <div className="cardetail-booking glass-card">
                                <h3 className="booking-title">Reservar este auto</h3>

                                <div className="booking-dates">
                                    <div className="input-group">
                                        <label className="input-label"><FiCalendar /> Fecha de retiro</label>
                                        <div className="input-wrapper">
                                            <FiCalendar className="input-icon" />
                                            <DatePicker
                                                selected={pickupDate}
                                                onChange={(date) => {
                                                    setPickupDate(date);
                                                    if (returnDate && date >= returnDate) {
                                                        setReturnDate(new Date(date.getTime() + 86400000));
                                                    }
                                                }}
                                                minDate={today}
                                                excludeDateIntervals={excludeIntervals}
                                                locale="es"
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Seleccionar fecha"
                                                className="input-field react-datepicker-custom"
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label"><FiCalendar /> Fecha de devolución</label>
                                        <div className="input-wrapper">
                                            <FiCalendar className="input-icon" />
                                            <DatePicker
                                                selected={returnDate}
                                                onChange={(date) => setReturnDate(date)}
                                                minDate={minReturnDate}
                                                excludeDateIntervals={excludeIntervals}
                                                locale="es"
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Seleccionar fecha"
                                                className="input-field react-datepicker-custom"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ALERTA DE SUPERPOSICIÓN DE FECHAS */}
                                {hasOverlap && (
                                    <div className="overlap-warning-banner">
                                        <FiAlertTriangle />
                                        <span>Las fechas seleccionadas ya están reservadas. Por favor elige otro rango.</span>
                                    </div>
                                )}

                                {totalDays() > 0 && !hasOverlap && (
                                    <div className="booking-summary">
                                        <div className="booking-summary-row">
                                            <span>${pricePerDayVal.toLocaleString()} × {totalDays()} días</span>
                                            <strong>${totalPrice.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                )}

                                {user ? (
                                    <button
                                        className="btn btn-primary btn-lg booking-btn"
                                        onClick={handleBook}
                                        disabled={booking || totalDays() === 0 || hasOverlap}
                                    >
                                        {booking ? <span className="spinner spinner-sm" /> : <><FiCheck /> Confirmar reserva</>}
                                    </button>
                                ) : (
                                    <button className="btn btn-outline btn-lg booking-btn" onClick={() => navigate('/login')}>
                                        Iniciá sesión para reservar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL LIGHTBOX PARA VER LA IMAGEN DEL AUTO COMPLETO */}
            {isImageModalOpen && (
                <div className="image-lightbox-modal animate-fade-in" onClick={() => setIsImageModalOpen(false)}>
                    <div className="lightbox-content glass-card" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close-btn" onClick={() => setIsImageModalOpen(false)}>
                            <FiX />
                        </button>
                        <div className="lightbox-image-box">
                            <img src={car.image} alt={car.name} className="lightbox-full-img" />
                        </div>
                        <div className="lightbox-footer">
                            <h4>{car.name}</h4>
                            <p>{car.type} · {car.year} · ${pricePerDayVal.toLocaleString()}/día</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarDetail;
