// src/components/MyBookings/MyBookings.jsx
import { useState, useEffect } from 'react';
import { FiCalendar, FiMessageSquare, FiX } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { PageLoader } from '../ui/Loader';
import api from '../../services/api';
import ChatWidget from '../Chat/ChatWidget';
import { formatBookingDate } from '../../utils/dateUtils';
import { confirmAction } from '../../utils/alertUtils';
import './MyBookings.css';

const TABS = [
    { key: 'all', label: 'Todas' },
    { key: 'pending_approval', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'paid', label: 'Pagadas' },
    { key: 'picked_up', label: 'En Uso (Retiradas)' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
];

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [activeChatBooking, setActiveChatBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/api/bookings/my');
                setBookings(data);
            } catch {
                toast.error('Error al cargar reservas');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        const confirmed = await confirmAction({
            title: '¿Cancelar esta reserva?',
            text: 'Esta acción cancelará tu solicitud de alquiler.',
            confirmButtonText: 'Sí, cancelar reserva',
            confirmButtonClass: 'btn btn-danger btn-sm',
            icon: 'warning'
        });
        if (!confirmed) return;

        try {
            await api.put(`/api/bookings/${id}/cancel`);
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
            toast.success('Reserva cancelada');
        } catch {
            toast.error('No se pudo cancelar');
        }
    };

    const handlePayment = async (bookingId) => {
        const confirmed = await confirmAction({
            title: '¿Proceder al pago?',
            text: 'Serás redirigido a Mercado Pago para abonar tu reserva.',
            confirmButtonText: 'Sí, ir a pagar',
            icon: 'info'
        });
        if (!confirmed) return;

        setPaymentLoading(bookingId);
        try {
            const { data } = await api.post('/api/bookings/mp-preference', { bookingId });
            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else {
                toast.error('No se pudo generar el pago');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al iniciar pago');
        } finally {
            setPaymentLoading(null);
        }
    };

    const filtered = activeTab === 'all'
        ? bookings
        : bookings.filter(b => b.status === activeTab || (activeTab === 'picked_up' && b.status === 'active'));

    if (loading) return <PageLoader text="Cargando tus reservas..." />;

    return (
        <div className="mybookings-page page-container">
            <div className="container">
                <div className="mybookings-header">
                    <h1 className="section-title">Mis Reservas</h1>
                    <p className="section-subtitle">{bookings.length} reserva{bookings.length !== 1 ? 's' : ''} en total</p>
                </div>

                {/* TABS */}
                <div className="booking-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`booking-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            {tab.key !== 'all' && (
                                <span className="tab-count">
                                    {bookings.filter(b => b.status === tab.key || (tab.key === 'picked_up' && b.status === 'active')).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* LISTA */}
                {filtered.length === 0 ? (
                    <EmptyState
                        icon={<FaCar />}
                        title="Sin reservas aquí"
                        description="No tenés reservas en este estado todavía."
                    />
                ) : (
                    <div className="bookings-list">
                        {filtered.map(booking => (
                            <div key={booking._id} className="booking-card animate-fade-in">
                                {/* AUTO */}
                                <div className="booking-car-info">
                                    <img src={booking.car?.image} alt={booking.car?.name} className="booking-car-img" />
                                    <div>
                                        <h3 className="booking-car-name">{booking.car?.name}</h3>
                                        <p className="booking-car-type">{booking.car?.type}</p>
                                    </div>
                                </div>

                                {/* DETALLES */}
                                <div className="booking-details">
                                    <div className="booking-date">
                                        <FiCalendar />
                                        <span>
                                            {formatBookingDate(booking.pickUpDate, "d MMM yyyy")}
                                            {' → '}
                                            {formatBookingDate(booking.dropOffDate, "d MMM yyyy")}
                                        </span>
                                    </div>
                                    <div className="booking-price">
                                        ${booking.totalPrice?.toLocaleString()}
                                    </div>
                                    <Badge status={booking.status} />
                                </div>

                                {/* ACCIONES */}
                                <div className="booking-actions">
                                    {booking.chatOpen && !['cancelled', 'completed'].includes(booking.status) && (
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => setActiveChatBooking(booking)}
                                        >
                                            <FiMessageSquare /> Chat
                                        </button>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handlePayment(booking._id)}
                                            disabled={paymentLoading === booking._id}
                                        >
                                            {paymentLoading === booking._id ? <span className="spinner spinner-sm" /> : 'Pagar ahora'}
                                        </button>
                                    )}
                                    {['pending_approval', 'confirmed'].includes(booking.status) && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleCancel(booking._id)}
                                        >
                                            <FiX /> Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CHAT MODAL */}
            {activeChatBooking && (
                <ChatWidget
                    booking={activeChatBooking}
                    onClose={() => setActiveChatBooking(null)}
                />
            )}
        </div>
    );
};

export default MyBookings;
