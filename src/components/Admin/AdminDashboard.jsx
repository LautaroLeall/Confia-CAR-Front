// src/components/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiCalendar, FiUsers, FiDollarSign, FiClock,
    FiArrowRight, FiPlusCircle, FiMessageSquare
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { PageLoader } from '../ui/Loader';
import Badge from '../ui/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatBookingDate } from '../../utils/dateUtils';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/admin/dashboard');
                setStats(data);
            } catch {
                toast.error('Error al cargar estadísticas');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <PageLoader text="Cargando dashboard..." />;

    const cards = [
        { icon: <FiClock />, label: 'Reservas Pendientes', value: stats?.pendingBookings || 0, color: 'warning', link: '/admin/reservas', linkText: 'Ver pendientes' },
        { icon: <FiCalendar />, label: 'Total Reservas', value: stats?.totalBookings || 0, color: 'info', link: '/admin/reservas', linkText: 'Gestionar' },
        { icon: <FiDollarSign />, label: 'Ganancias Totales', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'success', link: '/admin/reservas', linkText: 'Ver ingresos' },
        { icon: <FiUsers />, label: 'Total Usuarios', value: stats?.totalUsers || 0, color: 'primary', link: '/admin/usuarios', linkText: 'Ver usuarios' },
    ];

    return (
        <div className="admin-dashboard animate-fade-in">

            {/* HEADER BIENVENIDA Y ACCIONES RÁPIDAS */}
            <div className="admin-dashboard-header">
                <div>
                    <h1 className="admin-page-title mb-1">Panel de Control</h1>
                    <p className="admin-page-subtitle">Resumen general del estado de la plataforma ConfiaCAR</p>
                </div>

                <div className="admin-quick-actions">
                    <Link to="/admin/autos" className="btn btn-primary btn-sm">
                        <FiPlusCircle /> Nuevo Auto
                    </Link>
                    <Link to="/admin/chats" className="btn btn-secondary btn-sm">
                        <FiMessageSquare /> Centro de Chats
                    </Link>
                </div>
            </div>

            {/* METRICAS TARJETAS ELEGANTES */}
            <div className="stats-grid mb-8">
                {cards.map((card, i) => (
                    <div key={i} className={`stat-card glass-card stat-${card.color}`}>
                        <div className="stat-card-header">
                            <div className="stat-icon-wrapper">
                                {card.icon}
                            </div>
                            <Link to={card.link} className="stat-action-link">
                                <span>{card.linkText}</span>
                                <FiArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="stat-card-body">
                            <p className="stat-value">{card.value}</p>
                            <p className="stat-label">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ULTIMAS RESERVAS MEJORADAS */}
            <div className="recent-bookings-section">
                <div className="recent-bookings-header">
                    <div>
                        <h2 className="admin-section-title mb-1">Últimas reservas</h2>
                        <p className="recent-bookings-subtitle">Actividad reciente de alquileres y solicitudes</p>
                    </div>
                    <Link to="/admin/reservas" className="btn btn-ghost btn-sm">
                        Ver todas las reservas <FiArrowRight size={14} />
                    </Link>
                </div>

                {stats?.recentBookings?.length === 0 ? (
                    <div className="empty-dashboard-box glass-card">
                        <FaCar size={32} />
                        <p>No hay reservas registradas aún.</p>
                    </div>
                ) : (
                    <div className="recent-bookings-grid">
                        {(stats?.recentBookings || []).map((b) => (
                            <div key={b._id} className="recent-booking-card glass-card">

                                {/* AUTO */}
                                <div className="rb-car-col">
                                    {b.car?.image ? (
                                        <img src={b.car.image} alt={b.car.name} className="rb-car-img" />
                                    ) : (
                                        <div className="rb-car-img-placeholder">
                                            <FaCar />
                                        </div>
                                    )}
                                    <div className="rb-car-details">
                                        <h4 className="rb-car-title">{b.car?.name || 'Auto'}</h4>
                                        <span className="rb-car-type">{b.car?.type} • {b.car?.year || 2024}</span>
                                    </div>
                                </div>

                                {/* USUARIO */}
                                <div className="rb-user-col">
                                    <div className="rb-user-avatar">
                                        {b.user?.firstName?.[0] || 'U'}
                                    </div>
                                    <div className="rb-user-details">
                                        <span className="rb-user-name">{b.user?.firstName} {b.user?.lastName}</span>
                                        <span className="rb-user-email">{b.user?.email || 'Cliente'}</span>
                                    </div>
                                </div>

                                {/* FECHAS */}
                                <div className="rb-dates-col">
                                    <span className="rb-date-label">Fechas</span>
                                    <span className="rb-date-range">
                                        {formatBookingDate(b.pickUpDate, 'dd/MM/yy')} ➔ {formatBookingDate(b.dropOffDate, 'dd/MM/yy')}
                                    </span>
                                </div>

                                {/* ESTADO */}
                                <div className="rb-status-col">
                                    <Badge status={b.status} />
                                </div>

                                {/* PRECIO Y ACCIÓN */}
                                <div className="rb-price-col">
                                    <span className="rb-price">${b.totalPrice?.toLocaleString()}</span>
                                    <Link to="/admin/reservas" className="rb-action-btn" title="Gestionar en reservas">
                                        Gestionar
                                    </Link>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminDashboard;
