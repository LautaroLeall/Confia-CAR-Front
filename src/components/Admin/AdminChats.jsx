// src/components/Admin/AdminChats.jsx
import { useState, useEffect, useMemo } from 'react';
import { PageLoader } from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import {
    FiMessageSquare,
    FiSearch,
    FiCalendar,
    FiDollarSign,
    FiInfo,
    FiTrash2
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ChatWidget from '../Chat/ChatWidget';
import Badge from '../ui/Badge';
import { formatBookingDate } from '../../utils/dateUtils';
import { confirmAction } from '../../utils/alertUtils';
import './AdminChats.css';

const AdminChats = () => {
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'pending', 'confirmed'
    const [showDetails, setShowDetails] = useState(true);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/api/admin/bookings');
            setAllBookings(data);

            if (data.length > 0 && !selectedBookingId) {
                setSelectedBookingId(data[0]._id);
            }
        } catch {
            toast.error('Error al cargar historial de conversaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filtrar conversaciones según categoría seleccionada por el administrador
    const filteredBookings = useMemo(() => {
        return allBookings.filter(b => {
            const matchesSearch =
                `${b.user?.firstName} ${b.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.car?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesCategory = true;
            if (filterCategory === 'pending') {
                // Pendientes de pago (confirmadas pero sin pagar) o pendientes de aprobación
                matchesCategory = ['pending_approval', 'confirmed'].includes(b.status);
            } else if (filterCategory === 'confirmed') {
                // Confirmados / Pagos realizados / En uso / Completados
                matchesCategory = ['paid', 'picked_up', 'active', 'completed'].includes(b.status);
            }

            return matchesSearch && matchesCategory;
        });
    }, [allBookings, searchTerm, filterCategory]);

    // Reserva seleccionada actual
    const selectedBooking = useMemo(() => {
        return allBookings.find(b => b._id === selectedBookingId) || filteredBookings[0] || null;
    }, [allBookings, selectedBookingId, filteredBookings]);

    // Estadísticas del usuario seleccionado
    const selectedUserStats = useMemo(() => {
        if (!selectedBooking?.user?._id) return { totalBookings: 0, totalSpent: 0 };
        const userBookings = allBookings.filter(b => b.user?._id === selectedBooking.user?._id);
        const totalSpent = userBookings
            .filter(b => ['paid', 'picked_up', 'active', 'completed'].includes(b.status))
            .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
        return {
            totalBookings: userBookings.length,
            totalSpent
        };
    }, [selectedBooking, allBookings]);

    // Eliminar historial de un chat específico (Admin)
    const handleDeleteChat = async (bookingId, e) => {
        if (e) e.stopPropagation();

        const confirmed = await confirmAction({
            title: '¿Eliminar historial de chat?',
            text: 'Se eliminarán todos los mensajes guardados de esta conversación.',
            confirmButtonText: 'Sí, eliminar chat',
            confirmButtonClass: 'btn btn-danger btn-sm',
            icon: 'warning'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/messages/${bookingId}`);
            toast.success('Historial de chat eliminado');
            // Recargar o refrescar estado local
            fetchBookings();
        } catch {
            toast.error('Error al eliminar el historial de chat');
        }
    };

    if (loading) return <PageLoader text="Cargando centro de mensajes..." />;

    return (
        <div className="admin-inbox-container animate-fade-in">
            {/* INBOX BARRA DE TÍTULO */}
            <div className="admin-inbox-header">
                <div>
                    <h1 className="admin-page-title mb-0">Centro de Chats</h1>
                    <p className="admin-subtitle">Historial completo de conversaciones por cliente y vehículo</p>
                </div>
                <div className="inbox-header-stats">
                    <span className="badge badge-info">
                        <FiMessageSquare /> {allBookings.length} Conversaciones Guardadas
                    </span>
                </div>
            </div>

            {/* INBOX MAIN WORKSPACE (SPLIT 3 PANELS) */}
            <div className="admin-inbox-workspace">

                {/* PANEL 1: LISTA DE CHATS (IZQUIERDA) */}
                <div className="inbox-sidebar">
                    <div className="inbox-search-box">
                        <div className="input-wrapper">
                            <FiSearch className="input-icon" />
                            <input
                                type="text"
                                className="input-field search-input"
                                placeholder="Buscar por usuario o auto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* FILTROS DE CATEGORÍA */}
                        <div className="inbox-filter-tabs">
                            <button
                                className={`filter-tab ${filterCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterCategory('all')}
                            >
                                Todos ({allBookings.length})
                            </button>
                            <button
                                className={`filter-tab ${filterCategory === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilterCategory('pending')}
                            >
                                Pendientes
                            </button>
                            <button
                                className={`filter-tab ${filterCategory === 'confirmed' ? 'active' : ''}`}
                                onClick={() => setFilterCategory('confirmed')}
                            >
                                Confirmados
                            </button>
                        </div>
                    </div>

                    <div className="inbox-chat-list">
                        {filteredBookings.length === 0 ? (
                            <div className="inbox-no-chats">
                                <FiMessageSquare size={32} />
                                <p>No se encontraron conversaciones</p>
                            </div>
                        ) : (
                            filteredBookings.map(b => {
                                const isSelected = selectedBooking?._id === b._id;
                                const isFinished = ['completed', 'cancelled'].includes(b.status);

                                return (
                                    <div
                                        key={b._id}
                                        className={`inbox-chat-item ${isSelected ? 'active' : ''} ${isFinished ? 'chat-finished' : ''}`}
                                        onClick={() => setSelectedBookingId(b._id)}
                                    >
                                        <div className="item-avatar-wrapper">
                                            {b.user?.avatar ? (
                                                <img src={b.user.avatar} alt="User" className="item-avatar" />
                                            ) : (
                                                <div className="item-avatar-initials">
                                                    {b.user?.firstName?.[0]}{b.user?.lastName?.[0]}
                                                </div>
                                            )}
                                            {!isFinished && <span className="online-indicator" />}
                                        </div>

                                        <div className="item-content">
                                            <div className="item-header">
                                                <span className="item-user-name">{b.user?.firstName} {b.user?.lastName}</span>
                                                <Badge status={b.status} />
                                            </div>
                                            <div className="item-sub">
                                                <span className="item-car-name">{b.car?.name}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="item-close-btn"
                                            title="Eliminar historial de chat"
                                            onClick={(e) => handleDeleteChat(b._id, e)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* PANEL 2: AREA DE CHAT (CENTRO) */}
                <div className="inbox-chat-area">
                    {selectedBooking ? (
                        <>
                            {/* UNIFIED HEADER DEL CHAT */}
                            <div className="selected-chat-header">
                                <div className="selected-user-info">
                                    <div className="selected-avatar">
                                        {selectedBooking.user?.avatar ? (
                                            <img src={selectedBooking.user.avatar} alt="User" />
                                        ) : (
                                            <span>{selectedBooking.user?.firstName?.[0]}{selectedBooking.user?.lastName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className="header-text-details">
                                        <div className="user-title-line">
                                            <h3>{selectedBooking.user?.firstName} {selectedBooking.user?.lastName}</h3>
                                        </div>
                                        <div className="car-subtitle-line">
                                            <span className="car-tag-badge">Reserva: <strong>{selectedBooking.car?.name}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="selected-chat-actions">
                                    <button
                                        className={`btn btn-sm ${showDetails ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setShowDetails(!showDetails)}
                                        title="Ver detalles del usuario"
                                    >
                                        <FiInfo /> Detalles
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={(e) => handleDeleteChat(selectedBooking._id, e)}
                                        title="Eliminar historial de este chat"
                                    >
                                        <FiTrash2 /> Eliminar Chat
                                    </button>
                                </div>
                            </div>

                            {/* COMPONENTE WIDGET DE CHAT EMBEDDED */}
                            <div className="selected-chat-body">
                                <ChatWidget
                                    booking={selectedBooking}
                                    onClose={() => setSelectedBookingId(null)}
                                    embedded={true}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="inbox-empty-state">
                            <EmptyState
                                icon={<FiMessageSquare />}
                                title="Selecciona una conversación"
                                description="Haz clic en cualquier chat de la lista izquierda para visualizar el historial."
                            />
                        </div>
                    )}
                </div>

                {/* PANEL 3: INSIGHTS / DETALLES DE USUARIO (DERECHA - COLLAPSIBLE) */}
                {selectedBooking && showDetails && (
                    <div className="inbox-details-panel animate-slide-up">
                        <div className="details-panel-header">
                            <h4>Información del Cliente</h4>
                            <button className="btn-icon-close" onClick={() => setShowDetails(false)}>
                                &times;
                            </button>
                        </div>

                        <div className="details-user-card">
                            <div className="details-avatar">
                                {selectedBooking.user?.avatar ? (
                                    <img src={selectedBooking.user.avatar} alt="User" />
                                ) : (
                                    <div className="details-avatar-initials">
                                        {selectedBooking.user?.firstName?.[0]}{selectedBooking.user?.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            <h3>{selectedBooking.user?.firstName} {selectedBooking.user?.lastName}</h3>
                            <p className="details-user-email">{selectedBooking.user?.email}</p>
                        </div>

                        {/* ESTADÍSTICAS DEL CLIENTE */}
                        <div className="details-stats-grid">
                            <div className="details-stat-card">
                                <FiCalendar className="stat-icon-blue" />
                                <span className="stat-single-line">
                                    <strong>{selectedUserStats.totalBookings}</strong> Reservas Totales
                                </span>
                            </div>
                            <div className="details-stat-card">
                                <FiDollarSign className="stat-icon-green" />
                                <span className="stat-single-line">
                                    <strong>${selectedUserStats.totalSpent.toLocaleString()}</strong> Inversión Total
                                </span>
                            </div>
                        </div>

                        {/* DATOS DE LA RESERVA ACTUAL */}
                        <div className="details-booking-box">
                            <h5>Reserva en Consulta</h5>

                            {selectedBooking.car?.image && (
                                <img src={selectedBooking.car.image} alt={selectedBooking.car.name} className="details-car-img" />
                            )}

                            <div className="details-info-list">
                                <div className="info-row">
                                    <span>Vehículo:</span>
                                    <strong>{selectedBooking.car?.name}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Retiro:</span>
                                    <span>{selectedBooking.pickUpDate ? formatBookingDate(selectedBooking.pickUpDate, 'dd MMM yyyy') : 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span>Devolución:</span>
                                    <span>{selectedBooking.dropOffDate ? formatBookingDate(selectedBooking.dropOffDate, 'dd MMM yyyy') : 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span>Monto Total:</span>
                                    <strong className="text-success">${selectedBooking.totalPrice?.toLocaleString()}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Estado:</span>
                                    <Badge status={selectedBooking.status} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminChats;
