// src/components/Profile/Profile.jsx
import { useState, useContext } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
    const [savingPwd, setSavingPwd] = useState(false);

    const handlePwdChange = (e) => setPwdForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSavePwd = async (e) => {
        e.preventDefault();
        if (pwdForm.password !== pwdForm.confirmPassword) return toast.error('Las contraseñas no coinciden');
        if (pwdForm.password.length < 6) return toast.error('Mínimo 6 caracteres');
        setSavingPwd(true);
        try {
            await api.put('/api/auth/profile', { password: pwdForm.password });
            toast.success('Contraseña actualizada');
            setPwdForm({ currentPassword: '', password: '', confirmPassword: '' });
        } catch {
            toast.error('Error al actualizar contraseña');
        } finally {
            setSavingPwd(false);
        }
    };

    const getInitials = () => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="profile-page page-container">
            <div className="container">
                <h1 className="section-title">Mi Perfil</h1>
                <p className="section-subtitle">Administrá tu información personal</p>

                <div className="profile-grid">
                    {/* INFO */}
                    <div className="profile-card glass-card animate-fade-in">
                        <div className="profile-avatar-section">
                            {user?.avatar
                                ? <img src={user.avatar} alt="Avatar" className="profile-avatar-img" />
                                : <div className="profile-avatar-initials">{getInitials()}</div>
                            }
                            <div>
                                <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
                                {user?.isAdmin && <span className="badge badge-admin">Administrador</span>}
                            </div>
                        </div>

                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <FiUser className="info-icon" />
                                <div>
                                    <p className="info-label">Nombre completo</p>
                                    <p className="info-value">{user?.firstName} {user?.lastName}</p>
                                </div>
                            </div>
                            <div className="profile-info-item">
                                <FiMail className="info-icon" />
                                <div>
                                    <p className="info-label">Correo electrónico</p>
                                    <p className="info-value">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTRASEÑA — Solo si no es Google */}
                    {!user?.googleId && (
                        <div className="profile-card glass-card animate-slide-up">
                            <h3 className="profile-section-title">
                                <FiLock /> Cambiar contraseña
                            </h3>
                            <form className="pwd-form" onSubmit={handleSavePwd}>
                                <div className="input-group">
                                    <label className="input-label">Nueva contraseña</label>
                                    <div className="input-wrapper">
                                        <FiLock className="input-icon" />
                                        <input
                                            type={showNewPwd ? 'text' : 'password'}
                                            name="password"
                                            className="input-field"
                                            placeholder="Mínimo 6 caracteres"
                                            value={pwdForm.password}
                                            onChange={handlePwdChange}
                                        />
                                        <button type="button" className="input-icon-right" onClick={() => setShowNewPwd(!showNewPwd)}>
                                            {showNewPwd ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Confirmar contraseña</label>
                                    <div className="input-wrapper">
                                        <FiLock className="input-icon" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="input-field"
                                            placeholder="Repetí tu contraseña"
                                            value={pwdForm.confirmPassword}
                                            onChange={handlePwdChange}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={savingPwd}>
                                    {savingPwd ? <span className="spinner spinner-sm" /> : <><FiSave /> Guardar contraseña</>}
                                </button>
                            </form>
                        </div>
                    )}

                    {user?.googleId && (
                        <div className="profile-card glass-card animate-slide-up google-note">
                            <p>Iniciaste sesión con <strong>Google</strong>. La gestión de contraseña se hace desde tu cuenta de Google.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
