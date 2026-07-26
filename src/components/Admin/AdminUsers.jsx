// src/components/Admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { FiShield, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import { PageLoader } from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import { FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/api/admin/users');
                setUsers(data);
            } catch {
                toast.error('Error al cargar usuarios');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleAdmin = async (id) => {
        try {
            const { data } = await api.put(`/api/admin/users/${id}/role`);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isAdmin: data.isAdmin } : u));
            toast.success('Rol actualizado');
        } catch {
            toast.error('Error al actualizar rol');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este usuario permanentemente?')) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success('Usuario eliminado');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar');
        }
    };

    const filtered = users.filter(u =>
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <PageLoader text="Cargando usuarios..." />;

    return (
        <div className="admin-users animate-fade-in">
            <div className="admin-users-header">
                <h1 className="admin-page-title">Gestión de Usuarios</h1>
                <div className="input-wrapper" style={{ width: 280 }}>
                    <FiSearch className="input-icon" />
                    <input type="text" className="input-field" placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={<FiUsers />} title="Sin usuarios" description="No se encontraron usuarios." />
            ) : (
                <div className="admin-table-wrapper glass-card">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div className="table-user-info">
                                            {u.avatar
                                                ? <img src={u.avatar} alt={u.firstName} className="table-avatar" />
                                                : <div className="table-avatar-initials">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                                            }
                                            <span>{u.firstName} {u.lastName}</span>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.isAdmin ? <Badge status="admin" label="Admin" /> : <span className="text-muted">Usuario</span>}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className={`btn btn-sm ${u.isAdmin ? 'btn-ghost' : 'btn-outline'}`} onClick={() => handleToggleAdmin(u._id)}>
                                                <FiShield /> {u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                                            </button>
                                            {!u.isAdmin && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
                                                    <FiTrash2 /> Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
