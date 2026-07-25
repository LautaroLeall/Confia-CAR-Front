// src/components/ui/Badge.jsx
import './ui.css';

const STATUS_MAP = {
    pending_approval: {
        label: 'Pendiente',
        class: 'badge-pending'
    },
    pending: {
        label: 'Pendiente',
        class: 'badge-pending'
    },
    confirmed: {
        label: 'Confirmada',
        class: 'badge-confirmed'
    },
    paid: {
        label: 'Pagada',
        class: 'badge-paid'
    },
    picked_up: {
        label: 'En Uso / Retirado',
        class: 'badge-picked-up'
    },
    active: {
        label: 'En Uso / Retirado',
        class: 'badge-picked-up'
    },
    completed: {
        label: 'Completada',
        class: 'badge-completed'
    },
    cancelled: {
        label: 'Cancelada',
        class: 'badge-cancelled'
    },
    available: {
        label: 'Disponible',
        class: 'badge-available'
    },
    occupied: {
        label: 'Ocupado',
        class: 'badge-occupied'
    },
    admin: {
        label: 'Admin',
        class: 'badge-admin'
    },
};

const Badge = ({ status, label, showDot = false, className = '' }) => {
    const config = STATUS_MAP[status] || { label: label || status, class: 'badge-pending' };
    return (
        <span className={`badge ${config.class} ${className}`}>
            {showDot && <span className="badge-dot" />}
            {label || config.label}
        </span>
    );
};

export default Badge;
