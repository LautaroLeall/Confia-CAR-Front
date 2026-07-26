// src/components/Navbar/Navbar.jsx
import { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    FiMenu, FiX, FiUser, FiLogOut, FiShield,
    FiCalendar, FiCreditCard, FiHome, FiGrid,
    FiLogIn, FiUserPlus
} from 'react-icons/fi';
import logoSvg from '../../assets/logo/logo.svg';
import { confirmAction } from '../../utils/alertUtils';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    // Scroll listener → efecto de fondo al bajar
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Cerrar dropdown al click fuera
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Cerrar menú mobile al cambiar de ruta
    useEffect(() => {
        setMenuOpen(false);
        setDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        const confirmed = await confirmAction({
            title: '¿Cerrar sesión?',
            text: 'Se cerrará tu sesión actual en ConfiaCAR.',
            confirmButtonText: 'Sí, cerrar sesión',
            icon: 'question'
        });
        if (confirmed) {
            await logout();
            navigate('/');
        }
    };

    const getInitials = () => {
        if (!user) return '';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} animate-slide-down`}>
            <div className="navbar-inner">

                {/* LOGO */}
                <Link to="/" className="navbar-logo">
                    <img src={logoSvg} alt="ConfiaCAR Logo" width="120" height="24" style={{ height: '24px', width: 'auto' }} />
                    <span>Confia<span className="logo-accent">CAR</span></span>
                </Link>

                {/* LINKS (DESKTOP & MOBILE DRAWER) */}
                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <li>
                        <NavLink to="/inicio" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            <FiHome className="mobile-nav-icon" />
                            <span>Inicio</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/autos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            <FiGrid className="mobile-nav-icon" />
                            <span>Autos</span>
                        </NavLink>
                    </li>
                    {user && (
                        <>
                            <li>
                                <NavLink to="/mireservas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                    <FiCalendar className="mobile-nav-icon" />
                                    <span>Mis Reservas</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/mispagos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                    <FiCreditCard className="mobile-nav-icon" />
                                    <span>Mis Pagos</span>
                                </NavLink>
                            </li>
                        </>
                    )}
                    {user?.isAdmin && (
                        <li>
                            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link nav-link-admin active' : 'nav-link nav-link-admin'}>
                                <FiShield className="mobile-nav-icon" />
                                <span>Admin</span>
                            </NavLink>
                        </li>
                    )}

                    {/* SECTOR DE AUTENTICACIÓN / PERFIL EN MENÚ MOBILE */}
                    {!user ? (
                        <li className="mobile-menu-auth-row">
                            <div className="mobile-auth-card glass-card">
                                <p className="mobile-auth-text">Accedé a tu cuenta para gestionar tus reservas</p>
                                <div className="mobile-auth-btns-grid">
                                    <Link to="/login" className="btn btn-ghost btn-mobile-auth">
                                        <FiLogIn size={15} /> Ingresar
                                    </Link>
                                    <Link to="/register" className="btn btn-primary btn-mobile-auth">
                                        <FiUserPlus size={15} /> Registrarse
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ) : (
                        <li className="mobile-menu-profile-row">
                            <div className="mobile-profile-card glass-card">
                                <div className="mobile-profile-info">
                                    {user.avatar
                                        ? <img src={user.avatar} alt={user.firstName} className="mobile-avatar-img" />
                                        : <span className="mobile-avatar-initials">{getInitials()}</span>
                                    }
                                    <div className="mobile-user-details">
                                        <p className="mobile-user-name">{user.firstName} {user.lastName}</p>
                                        <p className="mobile-user-email">{user.email}</p>
                                    </div>
                                </div>
                                <div className="mobile-profile-actions">
                                    <Link to="/perfil" className="btn btn-ghost btn-sm w-full">
                                        <FiUser size={15} /> Mi perfil
                                    </Link>
                                    <button className="btn-danger-ghost w-full" onClick={handleLogout}>
                                        <FiLogOut size={15} /> Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>

                {/* ACCIONES DERECHA */}
                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu" ref={dropdownRef}>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {user.avatar
                                    ? <img src={user.avatar} alt={user.firstName} className="user-avatar-img" />
                                    : <span className="user-avatar-initials">{getInitials()}</span>
                                }
                                <span className="user-name-short">{user.firstName}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="user-dropdown animate-scale-in">
                                    <div className="dropdown-header">
                                        <p className="dropdown-name">{user.firstName} {user.lastName}</p>
                                        <p className="dropdown-email">{user.email}</p>
                                        {user.isAdmin && <span className="badge badge-admin mt-1">Admin</span>}
                                    </div>
                                    <div className="dropdown-divider" />
                                    <Link to="/perfil" className="dropdown-item">
                                        <FiUser /> Mi perfil
                                    </Link>
                                    <Link to="/mireservas" className="dropdown-item">
                                        <FiCalendar /> Mis reservas
                                    </Link>
                                    <Link to="/mispagos" className="dropdown-item">
                                        <FiCreditCard /> Mis pagos
                                    </Link>
                                    {user.isAdmin && (
                                        <>
                                            <div className="dropdown-divider" />
                                            <Link to="/admin" className="dropdown-item dropdown-item-admin">
                                                <FiShield /> Panel Admin
                                            </Link>
                                        </>
                                    )}
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                                        <FiLogOut /> Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* BOTONES EN DESKTOP ESTILIZADOS */}
                            <div className="navbar-auth-btns desktop-auth-btns">
                                <Link to="/login" className="nav-btn-login">Ingresar</Link>
                                <Link to="/register" className="nav-btn-register">Registrarse</Link>
                            </div>
                        </>
                    )}

                    {/* HAMBURGUESA MOBILE */}
                    <button
                        className="navbar-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menú"
                    >
                        {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
