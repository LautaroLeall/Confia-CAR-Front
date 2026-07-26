// src/components/Auth/Login.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import loginImage from '../../assets/auth/login_car.png';
import './Auth.css';

const Login = () => {
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Completá todos los campos');
        setLoading(true);
        const result = await login(form.email, form.password);
        setLoading(false);
        if (result.success) {
            toast.success(`¡Bienvenido, ${result.user.firstName}!`);
            navigate('/inicio');
        } else {
            toast.error(result.error || 'Credenciales incorrectas');
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

                {/* LOGO */}
                <Link to="/" className="auth-logo">
                    <FaCar className="auth-logo-icon" />
                    Confia<span>CAR</span>
                </Link>

                <div className="auth-form-wrapper">
                    <div className="auth-heading">
                        <h1>Bienvenido de vuelta</h1>
                        <p>Ingresá a tu cuenta para continuar</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* EMAIL */}
                        <div className="input-group">
                            <label className="input-label"><FiMail /> Correo electrónico</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field"
                                    placeholder="tu@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* CONTRASEÑA */}
                        <div className="input-group">
                            <label className="input-label"><FiLock /> Contraseña</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="input-field"
                                    placeholder="Tu contraseña"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="input-icon-right"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                            {loading ? <span className="spinner spinner-sm" /> : 'Ingresar'}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="divider">o</div>

                    {/* GOOGLE */}
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogle}
                            onError={() => toast.error('Error con Google')}
                            theme="filled_black"
                            text="signin_with"
                            width="100%"
                            shape="pill"
                        />
                    </div>

                    {/* LINKS */}
                    <div className="auth-links">
                        <p>¿No tenés cuenta? <Link to="/register" className="auth-link">Registrate</Link></p>
                        <Link to="/" className="auth-back"><FiArrowLeft /> Volver al inicio</Link>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL — imagen */}
            <div className="auth-right animate-fade-in">
                <div className="auth-right-overlay" />
                <img src={loginImage} alt="Auto" className="auth-image" />
                <div className="auth-right-text">
                    <h2>Tu próxima aventura<br />te espera</h2>
                    <p>Los mejores autos al mejor precio</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
