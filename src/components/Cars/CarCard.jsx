// src/components/Cars/CarCard.jsx
import { useNavigate } from 'react-router-dom';
import { BsPeopleFill, BsFuelPump } from 'react-icons/bs';
import { FiMapPin, FiCalendar } from 'react-icons/fi';
import { TbManualGearbox } from 'react-icons/tb';
import Badge from '../ui/Badge';
import { formatBookingDate } from '../../utils/dateUtils';
import './Cars.css';

const CarCard = ({ car }) => {
    const navigate = useNavigate();
    const isAvailable = car.isAvailable;
    const priceVal = car.price || car.pricePerDay || 0;
    const activeBookings = car.activeBookings || [];

    const availableFrom = car.availableFrom
        ? formatBookingDate(car.availableFrom, "d 'de' MMM")
        : null;

    return (
        <div className="car-card glass-card animate-fade-in" onClick={() => navigate(`/autos/${car._id || car.id}`)}>
            {/* IMAGEN */}
            <div className="car-card-img-wrapper">
                <img src={car.image} alt={car.name} className="car-card-img" />
                <div className="car-card-overlay" />
                <div className="car-card-badge-wrapper">
                    <Badge status={isAvailable ? 'available' : 'occupied'} />
                </div>
                <div className="car-card-price">
                    <span>${priceVal.toLocaleString()}</span>
                    <small>/día</small>
                </div>
            </div>

            {/* INFO */}
            <div className="car-card-body">
                <div className="car-card-header">
                    <div>
                        <h3 className="car-card-name">{car.name}</h3>
                        <p className="car-card-type">{car.type} · {car.year}</p>
                    </div>
                </div>

                {/* SPECS */}
                <div className="car-specs-grid">
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

                {/* FECHAS YA RESERVADAS (BADGE ROJO) */}
                {activeBookings.length > 0 && (
                    <div className="car-card-booked-dates-badge">
                        <FiCalendar />
                        <span>
                            {activeBookings.length === 1 ? (
                                <>Reservado del {formatBookingDate(activeBookings[0].pickUpDate, "dd/MM")} al {formatBookingDate(activeBookings[0].dropOffDate, "dd/MM")}</>
                            ) : (
                                <>{activeBookings.length} períodos ya reservados</>
                            )}
                        </span>
                    </div>
                )}

                {/* DISPONIBILIDAD DE DISPONIBLE DESDE */}
                {!isAvailable && availableFrom && (
                    <div className="car-card-unavailable">
                        <FiCalendar />
                        <span>Disponible desde {availableFrom}</span>
                    </div>
                )}

                {/* BOTON */}
                <button
                    className={`btn car-card-btn ${isAvailable ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={(e) => { e.stopPropagation(); navigate(`/autos/${car._id || car.id}`); }}
                >
                    {isAvailable ? 'Ver detalles' : 'Ver disponibilidad'}
                </button>
            </div>
        </div>
    );
};

export default CarCard;
