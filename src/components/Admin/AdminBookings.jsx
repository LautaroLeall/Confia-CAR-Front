// src/components/Admin/AdminBookings.jsx
import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiCheckCircle, FiMessageSquare, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import { PageLoader } from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import api from '../../services/api';
import ChatWidget from '../Chat/ChatWidget';
import { parseBookingDate, formatBookingDate } from '../../utils/dateUtils';
import { confirmAction } from '../../utils/alertUtils';
import './AdminBookings.css';

const TABS = [
    { key: 'all', label: 'Todas' },
    { key: 'pending_approval', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'paid', label: 'Pagadas' },
    { key: 'picked_up', label: 'En Uso (Retiradas)' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
];

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [activeChatBooking, setActiveChatBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/api/admin/bookings');
                setBookings(data);
            } catch {
                toast.error('Error al cargar reservas');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const action = async (id, type) => {
        let title = '¿Actualizar estado?';
        let text = 'Se cambiará el estado de la reserva.';
        let icon = 'question';
        let confirmButtonClass = 'btn btn-primary btn-sm';

        if (type === 'confirm') {
            title = '¿Confirmar reserva?';
            text = 'La reserva se marcará como confirmada y se habilitará el chat.';
            icon = 'question';
        } else if (type === 'pay') {
            title = '¿Marcar como pagada?';
            text = 'Se registrará que el cliente ha abonado la reserva.';
            icon = 'success';
            confirmButtonClass = 'btn btn-success btn-sm';
        } else if (type === 'pickup') {
            title = '¿Marcar vehículo como retirado?';
            text = 'El auto pasará a estar En Uso / Retirado por el cliente.';
            icon = 'info';
        } else if (type === 'complete') {
            title = '¿Marcar vehículo como devuelto?';
            text = 'La reserva finalizará y el auto volverá a estar disponible.';
            icon = 'success';
            confirmButtonClass = 'btn btn-success btn-sm';
        } else if (type === 'cancel') {
            title = '¿Cancelar esta reserva?';
            text = 'Esta acción cancelará la reserva del cliente.';
            icon = 'warning';
            confirmButtonClass = 'btn btn-danger btn-sm';
        }

        const confirmed = await confirmAction({
            title,
            text,
            icon,
            confirmButtonText: 'Sí, continuar',
            confirmButtonClass
        });
        if (!confirmed) return;

        try {
            const { data } = await api.put(`/api/admin/bookings/${id}/${type}`);
            if (data.booking) {
                setBookings(prev => prev.map(b => b._id === id ? data.booking : b));
            } else {
                const newStatus = type === 'confirm' ? 'confirmed' : type === 'pay' ? 'paid' : type === 'pickup' ? 'picked_up' : type === 'cancel' ? 'cancelled' : 'completed';
                setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
            }
            toast.success(data.message || 'Estado actualizado');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al actualizar');
        }
    };

    const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab || (activeTab === 'picked_up' && b.status === 'active'));

    if (loading) return <PageLoader text="Cargando reservas..." />;

    return (
        <div className="admin-bookings animate-fade-in">
            <h1 className="admin-page-title">Gestión de Reservas y Alquileres</h1>
            <div className="booking-tabs">
                {TABS.map(tab => (
                    <button key={tab.key} className={`booking-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.label}
                        <span className="tab-count">
                            {tab.key === 'all'
                                ? bookings.length
                                : bookings.filter(b => b.status === tab.key || (tab.key === 'picked_up' && b.status === 'active')).length}
                        </span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={<FiCalendar />} title="Sin reservas" description="No hay reservas en este estado." />
            ) : (
                <div className="admin-table-wrapper glass-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Auto</th><th>Usuario</th><th>Fechas</th><th>Total</th><th>Estado</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(b => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const pickupDate = parseBookingDate(b.pickUpDate);
                                pickupDate.setHours(0, 0, 0, 0);

                                const canPickup = today >= pickupDate;

                                return (
                                    <tr key={b._id}>
                                        <td>
                                            <div className="table-user-info">
                                                <img src={b.car?.image} alt={b.car?.name} className="table-avatar" style={{ borderRadius: '6px' }} />
                                                <span className="table-car-name">{b.car?.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="table-user">{b.user?.firstName} {b.user?.lastName}<br /><small>{b.user?.email}</small></span></td>
                                        <td>{formatBookingDate(b.pickUpDate, 'd MMM')} → {formatBookingDate(b.dropOffDate, 'd MMM yy')}</td>
                                        <td><strong>${b.totalPrice?.toLocaleString()}</strong></td>
                                        <td><Badge status={b.status} /></td>
                                        <td>
                                            <div className="table-actions">
                                                {/* CHAT ACTION */}
                                                {b.chatOpen && !['cancelled', 'completed'].includes(b.status) && (
                                                    <button className="btn btn-outline btn-sm" onClick={() => setActiveChatBooking(b)}>
                                                        <FiMessageSquare /> Chat
                                                    </button>
                                                )}

                                                {/* 1. PENDIENTE -> CONFIRMAR */}
                                                {b.status === 'pending_approval' && (
                                                    <button className="btn btn-success btn-sm" onClick={() => action(b._id, 'confirm')}>
                                                        <FiCheck /> Confirmar
                                                    </button>
                                                )}

                                                {/* 2. CONFIRMADA -> MARCAR PAGADO */}
                                                {b.status === 'confirmed' && (
                                                    <button className="btn btn-success btn-sm" onClick={() => action(b._id, 'pay')}>
                                                        <FiDollarSign /> Marcar Pagado
                                                    </button>
                                                )}

                                                {/* 3. PAGADA -> MARCAR RETIRADO (Solo el día del retiro o posterior) */}
                                                {b.status === 'paid' && (
                                                    canPickup ? (
                                                        <button className="btn btn-primary btn-sm" onClick={() => action(b._id, 'pickup')}>
                                                            <FaCar /> Marcar Retirado
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            disabled
                                                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                                            title={`Retiro disponible a partir de ${formatBookingDate(b.pickUpDate, 'd MMM yyyy')}`}
                                                        >
                                                            <FaCar /> Retiro el {formatBookingDate(b.pickUpDate, 'd MMM')}
                                                        </button>
                                                    )
                                                )}

                                                {/* 4. EN USO / RETIRADA -> MARCAR DEVUELTO (FINALIZAR) */}
                                                {['picked_up', 'active'].includes(b.status) && (
                                                    <button className="btn btn-success btn-sm" onClick={() => action(b._id, 'complete')}>
                                                        <FiCheckCircle /> Marcar Devuelto
                                                    </button>
                                                )}

                                                {/* BOTÓN CANCELAR */}
                                                {!['cancelled', 'completed', 'picked_up', 'active'].includes(b.status) && (
                                                    <button className="btn btn-danger btn-sm" onClick={() => action(b._id, 'cancel')}>
                                                        <FiX /> Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CHAT MODAL ADMIN */}
            {activeChatBooking && (
                <ChatWidget
                    booking={activeChatBooking}
                    onClose={() => setActiveChatBooking(null)}
                />
            )}
        </div>
    );
};

export default AdminBookings;