// src/components/ui/Loader.jsx
import './ui.css';

export const Spinner = ({ size = 'md', className = '' }) => (
    <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''} ${className}`} />
);

export const PageLoader = ({ text = 'Cargando...' }) => (
    <div className="page-loader animate-fade-in">
        <div className="spinner" />
        <p className="ui-loader-text">{text}</p>
    </div>
);

export const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-img" />
        <div className="skeleton-body">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text short" />
        </div>
    </div>
);
