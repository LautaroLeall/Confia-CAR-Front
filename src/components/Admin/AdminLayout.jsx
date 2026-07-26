// src/components/Admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiCalendar, FiUsers, FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import { FaShieldAlt, FaCar } from 'react-icons/fa';
import './AdminLayout.css';

import { confirmAction } from '../../utils/alertUtils';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleExitAdmin = async () => {
        const confirmed = await confirmAction({
            title: '¿Salir del Panel de Admin?',
            text: 'Volverás a la vista pública de clientes.',
            confirmButtonText: 'Sí, salir',
            icon: 'question'
        });
        if (confirmed) {
            navigate('/inicio');
        }
    };

    return (
        <div className="admin-layout">
            <div className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <FaShieldAlt />
                    <span>Panel Admin</span>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <FiGrid /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/autos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <FaCar /> Autos
                    </NavLink>
                    <NavLink to="/admin/reservas" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <FiCalendar /> Reservas
                    </NavLink>
                    <NavLink to="/admin/chats" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <FiMessageCircle /> Chats
                    </NavLink>
                    <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <FiUsers /> Usuarios
                    </NavLink>
                </nav>
                <button className="btn btn-ghost btn-sm admin-back-btn" onClick={handleExitAdmin}>
                    <FiArrowLeft /> Salir del panel
                </button>
            </div>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
