// src/components/ui/Loader.jsx
import './ui.css';

export const Spinner = ({ size = 'md', className = '' }) => (
    <div className={`cc-spinner cc-spinner-${size} ${className}`} />
);

export const PageLoader = ({ text = 'Cargando...' }) => (
    <div className="cc-page-loader animate-fade-in">
        <div className="cc-page-loader-box glass-card">
            <div className="cc-spinner cc-spinner-lg" />
            <p className="cc-loader-text">{text}</p>
        </div>
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
