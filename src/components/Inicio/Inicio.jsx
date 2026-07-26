// src/components/Inicio/Inicio.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiSearch } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import mainCarImg from '../../assets/home/main_car.png';
import './Inicio.css';

registerLocale('es', es);

const LOCATIONS = [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza',
    'Mar del Plata', 'Salta', 'Tucumán', 'Bariloche',
];

const Inicio = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [pickupDate, setPickupDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);
    const [loading, setLoading] = useState(false);

    const today = new Date();
    const minReturnDate = pickupDate
        ? new Date(pickupDate.getTime() + 86400000) // Mínimo 1 día después de la fecha de retiro
        : new Date(today.getTime() + 86400000);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!location) return toast.error('Seleccioná un lugar de retiro');
        if (!pickupDate) return toast.error('Elegí una fecha de inicio');
        if (!returnDate) return toast.error('Elegí una fecha de devolución');
        if (returnDate <= pickupDate) return toast.error('El alquiler debe ser de al menos 1 día completo');

        setLoading(true);
        setTimeout(() => {
            navigate('/autos', {
                state: {
                    location,
                    pickupDate: format(pickupDate, 'yyyy-MM-dd'),
                    returnDate: format(returnDate, 'yyyy-MM-dd')
                }
            });
        }, 400);
    };

    return (
        <div className="inicio-page page-container">
            {/* HERO SECTION */}
            <section className="inicio-hero">
                <div className="container">
                    <div className="inicio-hero-content animate-slide-up">
                        <div className="inicio-hero-text">
                            <div className="inicio-hero-badge">
                                <FaCar /> Alquiler de autos premium
                            </div>
                            <h1 className="inicio-hero-title">
                                El auto perfecto<br />
                                <span className="gradient-text">para cada viaje</span>
                            </h1>
                            <p className="inicio-hero-subtitle">
                                Elegí el destino, las fechas y encontrá tu auto ideal.<br />
                                Reserva en minutos con total seguridad.
                            </p>
                        </div>
                        <div className="inicio-hero-image-wrapper">
                            <img src={mainCarImg} alt="Auto Principal" className="inicio-hero-image animate-float" />
                        </div>
                    </div>

                    {/* FORMULARIO DE BÚSQUEDA */}
                    <form
                        className="search-form glass-card animate-slide-up delay-200"
                        onSubmit={handleSearch}
                    >
                        <div className="search-form-grid">

                            {/* LUGAR */}
                            <div className="search-field">
                                <label className="input-label">
                                    <FiMapPin /> Lugar de retiro
                                </label>
                                <div className="input-wrapper">
                                    <FiMapPin className="input-icon" />
                                    <select
                                        name="location"
                                        className="input-field search-select"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    >
                                        <option value="">Seleccioná una ciudad</option>
                                        {LOCATIONS.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* FECHA INICIO */}
                            <div className="search-field">
                                <label className="input-label">
                                    <FiCalendar /> Fecha de retiro
                                </label>
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
                                        locale="es"
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Seleccionar fecha"
                                        className="input-field react-datepicker-custom"
                                    />
                                </div>
                            </div>

                            {/* FECHA FIN */}
                            <div className="search-field">
                                <label className="input-label">
                                    <FiCalendar /> Fecha de devolución
                                </label>
                                <div className="input-wrapper">
                                    <FiCalendar className="input-icon" />
                                    <DatePicker
                                        selected={returnDate}
                                        onChange={(date) => setReturnDate(date)}
                                        minDate={minReturnDate}
                                        locale="es"
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Seleccionar fecha"
                                        className="input-field react-datepicker-custom"
                                    />
                                </div>
                            </div>

                            {/* BOTON */}
                            <button
                                type="submit"
                                className={`btn btn-primary search-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner spinner-sm" />
                                ) : (
                                    <FiSearch size={18} />
                                )}
                                Buscar autos
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Inicio;
