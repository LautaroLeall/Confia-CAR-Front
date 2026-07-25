// src/components/ui/EmptyState.jsx
import './ui.css';

const EmptyState = ({ icon, title, description, action }) => (
    <div className="empty-state animate-fade-in">

        {icon && <div className="empty-state-icon">{icon}</div>}

        <h3 className="empty-state-title">{title}</h3>

        {description && <p className="empty-state-desc">{description}</p>}

        {action && <div className="empty-state-action">{action}</div>}
    </div>
);

export default EmptyState;
