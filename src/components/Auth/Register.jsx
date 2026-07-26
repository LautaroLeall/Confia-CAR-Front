// src/components/Auth/Register.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import registerImage from '../../assets/auth/register_car.png';
import './Auth.css';

const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Débil', color: 'var(--danger)', width: '25%' };
    if (pwd.length < 8) return { label: 'Regular', color: 'var(--warning)', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Buena', color: 'var(--info)', width: '75%' };
    return { label: 'Fuerte', color: 'var(--success)', width: '100%' };
};

const Register = () => {
    const { register, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const strength = getPasswordStrength(form.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.firstName || !form.lastName || !form.email || !form.password) return toast.error('Completá todos los campos');
        if (form.password !== form.confirmPassword) return toast.error('Las contraseñas no coinciden');
        if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');

        setLoading(true);
        const fullName = `${form.firstName} ${form.lastName}`;
        const result = await register(fullName, form.email, form.password);
        setLoading(false);

        if (result.success) {
            toast.success('¡Cuenta creada con éxito!');
            navigate('/inicio');
        } else {
            toast.error(result.error || 'Error al registrarse');
        }
    };

    const handleGoogle = async (credentialResponse) => {
        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            toast.success(`¡Bienvenido, ${result.user.firstName}!`);
            navigate('/inicio');
        } else {
            toast.error(result.error || 'Error con Google');
        }
    };

    return (
        <div className="auth-page">
            {/* LEFT PANEL */}
            <div className="auth-left animate-slide-up">
                <Link to="/" className="auth-logo">
                    <FaCar className="auth-logo-icon" />
                    Confia<span>CAR</span>
                </Link>

                <div className="auth-form-wrapper">
                    <div className="auth-heading">
                        <h1>Crear cuenta</h1>
                        <p>Registrate gratis y empezá a reservar</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* NOMBRE + APELLIDO */}
                        <div className="auth-row">
                            <div className="input-group">
                                <label className="input-label"><FiUser /> Nombre</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input type="text" name="firstName" className="input-field" placeholder="Juan" value={form.firstName} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label"><FiUser /> Apellido</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input type="text" name="lastName" className="input-field" placeholder="García" value={form.lastName} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="input-group">
                            <label className="input-label"><FiMail /> Correo electrónico</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input type="email" name="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={handleChange} />
                            </div>
                        </div>

                        {/* CONTRASEÑA */}
                        <div className="input-group">
                            <div className="input-label-row">
                                <label className="input-label"><FiLock /> Contraseña</label>
                                {strength && (
                                    <span className="strength-badge-inline" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                )}
                            </div>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="input-field"
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {strength && (
                                <div className="strength-bar-fixed">
                                    <div className="strength-fill" style={{ width: strength.width, background: strength.color }} />
                                </div>
                            )}
                        </div>

                        {/* CONFIRMAR */}
                        <div className="input-group">
                            <label className="input-label"><FiLock /> Confirmar contraseña</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input type="password" name="confirmPassword" className="input-field" placeholder="Repetí tu contraseña" value={form.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                            {loading ? <span className="spinner spinner-sm" /> : 'Crear cuenta'}
                        </button>
                    </form>

                    <div className="divider">o</div>
                    <div className="google-btn-wrapper">
                        <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Error con Google')} theme="filled_black" text="signup_with" width="100%" shape="pill" />
                    </div>

                    <div className="auth-links">
                        <p>¿Ya tenés cuenta? <Link to="/login" className="auth-link">Ingresá</Link></p>
                        <Link to="/" className="auth-back"><FiArrowLeft /> Volver al inicio</Link>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="auth-right animate-fade-in">
                <div className="auth-right-overlay" />
                <img src={registerImage} alt="Auto" className="auth-image" />
                <div className="auth-right-text">
                    <h2>Maneja la<br />diferencia</h2>
                    <p>Registrate y explorá nuestra flota exclusiva</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
