// src/components/Admin/AdminCars.jsx
import { useState, useEffect, useMemo } from 'react';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiLock,
    FiUnlock,
    FiSearch,
    FiArrowLeft,
    FiCheck,
    FiMapPin,
    FiCalendar,
    FiUpload,
    FiLink,
    FiImage,
    FiDollarSign
} from 'react-icons/fi';
import { BsPeopleFill, BsFuelPump } from 'react-icons/bs';
import { TbManualGearbox } from 'react-icons/tb';
import { FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import { PageLoader } from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import api from '../../services/api';
import { confirmAction } from '../../utils/alertUtils';
import './AdminCars.css';

const LOCATIONS = [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza',
    'Mar del Plata', 'Salta', 'Tucumán', 'Bariloche',
];

const CAR_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Pickup', 'Coupe', 'Minivan', 'Deportivo'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSION_TYPES = ['Automatic', 'Manual'];

const INITIAL_FORM = {
    name: '',
    type: 'SUV',
    year: new Date().getFullYear(),
    seats: 5,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    location: 'Tucumán',
    price: 180,
    description: '',
    image: '',
    isAvailable: true
};

const AdminCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' o 'form'
    const [editingCar, setEditingCar] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [imageInputMode, setImageInputMode] = useState('file'); // 'file' o 'url'
    const [submitting, setSubmitting] = useState(false);

    const fetchCars = async () => {
        try {
            const { data } = await api.get('/api/cars');
            setCars(data);
        } catch {
            toast.error('Error al cargar la flota de autos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    // Abrir Vista Formulario para Crear
    const handleOpenCreate = () => {
        setEditingCar(null);
        setFormData(INITIAL_FORM);
        setImageInputMode('file');
        setViewMode('form');
    };

    // Abrir Vista Formulario para Editar
    const handleOpenEdit = (car) => {
        setEditingCar(car);
        setFormData({
            name: car.name || '',
            type: car.type || 'SUV',
            year: car.year || new Date().getFullYear(),
            seats: car.seats || 5,
            fuel: car.fuel || 'Gasoline',
            transmission: car.transmission || 'Automatic',
            location: car.location || 'Tucumán',
            price: car.price || car.pricePerDay || 180,
            description: car.description || '',
            image: car.image || '',
            isAvailable: car.isAvailable !== false
        });
        setImageInputMode(car.image && car.image.startsWith('data:') ? 'file' : 'url');
        setViewMode('form');
    };

    // Cargar imagen local desde la computadora (Base64)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error('La imagen no debe superar los 5MB');
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result }));
            toast.success('Imagen cargada en tiempo real');
        };
        reader.readAsDataURL(file);
    };

    // Eliminar imagen cargada
    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        toast.success('Imagen eliminada');
    };

    // Guardar (Crear o Editar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.image || !formData.description) {
            return toast.error('Por favor completa todos los campos requeridos');
        }

        const isEdit = !!editingCar;
        const confirmed = await confirmAction({
            title: isEdit ? '¿Guardar cambios en el vehículo?' : '¿Registrar nuevo vehículo?',
            text: isEdit ? `Se actualizarán los datos de ${formData.name}.` : `Se agregará ${formData.name} a la flota de autos.`,
            confirmButtonText: isEdit ? 'Sí, guardar' : 'Sí, registrar',
            icon: 'question'
        });
        if (!confirmed) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                year: Number(formData.year),
                seats: Number(formData.seats),
                price: Number(formData.price),
                pricePerDay: Number(formData.price)
            };

            if (editingCar) {
                const targetId = editingCar._id || editingCar.id;
                const { data } = await api.put(`/api/cars/${targetId}`, payload);
                setCars(prev => prev.map(c => (c._id === targetId || c.id === targetId) ? data : c));
                toast.success('Vehículo actualizado exitosamente');
            } else {
                const { data } = await api.post('/api/cars', payload);
                setCars(prev => [data, ...prev]);
                toast.success('Nuevo vehículo registrado');
            }
            setViewMode('list');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar el vehículo');
        } finally {
            setSubmitting(false);
        }
    };

    // Alternar disponibilidad (Bloquear / Activar)
    const handleToggleAvailability = async (car) => {
        const targetId = car._id || car.id;
        const newStatus = !car.isAvailable;

        const confirmed = await confirmAction({
            title: newStatus ? '¿Activar vehículo?' : '¿Bloquear vehículo?',
            text: newStatus ? `El vehículo ${car.name} estará disponible para alquilar.` : `El vehículo ${car.name} quedará bloqueado y no podrá alquilarse.`,
            confirmButtonText: newStatus ? 'Sí, activar' : 'Sí, bloquear',
            confirmButtonClass: newStatus ? 'btn btn-primary btn-sm' : 'btn btn-danger btn-sm',
            icon: newStatus ? 'info' : 'warning'
        });
        if (!confirmed) return;

        try {
            await api.put(`/api/cars/${targetId}`, { isAvailable: newStatus });
            setCars(prev => prev.map(c => (c._id === targetId || c.id === targetId) ? { ...c, isAvailable: newStatus } : c));
            toast.success(newStatus ? 'Vehículo activado' : 'Vehículo bloqueado');
        } catch {
            toast.error('Error al actualizar disponibilidad');
        }
    };

    // Eliminar vehículo
    const handleDelete = async (car) => {
        const confirmed = await confirmAction({
            title: '¿Eliminar vehículo?',
            text: `Se eliminará permanentemente el vehículo ${car.name}. Esta acción no se puede deshacer.`,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonClass: 'btn btn-danger btn-sm',
            icon: 'warning'
        });
        if (!confirmed) return;

        const targetId = car._id || car.id;
        try {
            await api.delete(`/api/cars/${targetId}`);
            setCars(prev => prev.filter(c => c._id !== targetId && c.id !== targetId));
            toast.success('Vehículo eliminado');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar');
        }
    };

    const filteredCars = useMemo(() => {
        return cars.filter(c =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.location?.toLowerCase().includes(search.toLowerCase()) ||
            c.type?.toLowerCase().includes(search.toLowerCase())
        );
    }, [cars, search]);

    if (loading) return <PageLoader text="Cargando catálogo..." />;

    // VISTA 1: LISTADO DE AUTOS
    if (viewMode === 'list') {
        return (
            <div className="admin-cars-page animate-fade-in">
                {/* HEADER */}
                <div className="admin-cars-header">
                    <div>
                        <h1 className="admin-page-title mb-0">Gestión de Flota de Autos</h1>
                        <p className="admin-subtitle">Administra los vehículos, precios, especificaciones y estado</p>
                    </div>

                    <div className="admin-cars-actions">
                        <div className="input-wrapper search-wrapper">
                            <FiSearch className="input-icon" />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Buscar auto, tipo o ciudad..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleOpenCreate}>
                            <FiPlus /> Registrar Nuevo Auto
                        </button>
                    </div>
                </div>

                {/* GRILLA DE VEHÍCULOS */}
                {filteredCars.length === 0 ? (
                    <EmptyState
                        icon={<FaCar />}
                        title="Sin vehículos registrados"
                        description="No se encontraron coincidencias para la búsqueda."
                    />
                ) : (
                    <div className="admin-cars-grid">
                        {filteredCars.map(car => (
                            <div key={car._id || car.id} className={`admin-car-card glass-card ${!car.isAvailable ? 'blocked' : ''}`}>
                                <div className="car-card-image-box">
                                    <img src={car.image} alt={car.name} className="admin-car-img" />
                                    <div className="car-card-overlay" />
                                    <div className="car-card-badge-wrapper">
                                        <Badge status={car.isAvailable ? 'available' : 'occupied'} />
                                    </div>
                                    <div className="car-price-badge">
                                        <span>${(car.price || car.pricePerDay)?.toLocaleString()}</span>
                                        <small>/día</small>
                                    </div>
                                </div>

                                <div className="car-card-content">
                                    <div className="car-main-info">
                                        <h3>{car.name}</h3>
                                        <span className="car-subtitle">{car.type} · {car.year}</span>
                                    </div>

                                    <div className="admin-car-specs-grid">
                                        <div className="admin-spec-chip"><BsPeopleFill /> <span>{car.seats} asientos</span></div>
                                        <div className="admin-spec-chip"><BsFuelPump /> <span>{car.fuel}</span></div>
                                        <div className="admin-spec-chip"><TbManualGearbox /> <span>{car.transmission}</span></div>
                                        <div className="admin-spec-chip"><FiMapPin /> <span>{car.location}</span></div>
                                    </div>

                                    <p className="car-desc-preview">{car.description}</p>

                                    <div className="car-admin-buttons">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleOpenEdit(car)}
                                        >
                                            <FiEdit2 /> Editar
                                        </button>

                                        <button
                                            className={`btn btn-sm ${car.isAvailable ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                            onClick={() => handleToggleAvailability(car)}
                                        >
                                            {car.isAvailable ? <><FiLock /> Bloquear</> : <><FiUnlock /> Activar</>}
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(car)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // VISTA 2: FORMULARIO COMPLETO Y ANIMADO (CREAR / EDITAR)
    return (
        <div className="admin-form-page-workspace animate-fade-in">

            {/* HEADER DEL FORMULARIO */}
            <div className="form-workspace-header glass-card">
                <button className="btn btn-ghost btn-sm back-to-list-btn" onClick={() => setViewMode('list')}>
                    <FiArrowLeft /> Volver a la Lista de Autos
                </button>
                <div className="form-workspace-titles">
                    <h2>{editingCar ? `Editar ${editingCar.name}` : 'Registrar Nuevo Vehículo'}</h2>
                    <p>Completa las especificaciones, carga la imagen en tiempo real y gestiona la disponibilidad</p>
                </div>
            </div>

            {/* FORMULARIO DIVIDIDO EN 2 COLUMNAS */}
            <form onSubmit={handleSubmit} className="form-workspace-body">

                {/* COLUMNA IZQUIERDA: CARGA DE IMAGEN + VISTA PREVIA + SWITCH EN 1 SOLO RENGLÓN */}
                <div className="form-left-col glass-card">
                    <div className="image-upload-section">
                        {/* HEADER DE CARGA DE IMAGEN CON FLEX WRAP PARA EVITAR OVERFLOW */}
                        <div className="image-mode-toggle">
                            <label className="custom-label mb-0">Imagen del Vehículo *</label>
                            <div className="toggle-tabs">
                                <button
                                    type="button"
                                    className={`tab-btn ${imageInputMode === 'file' ? 'active' : ''}`}
                                    onClick={() => setImageInputMode('file')}
                                >
                                    <FiUpload /> Cargar desde PC
                                </button>
                                <button
                                    type="button"
                                    className={`tab-btn ${imageInputMode === 'url' ? 'active' : ''}`}
                                    onClick={() => setImageInputMode('url')}
                                >
                                    <FiLink /> URL Enlace
                                </button>
                            </div>
                        </div>

                        {imageInputMode === 'file' ? (
                            <div className="file-upload-dropzone">
                                <FiUpload className="dropzone-icon" />
                                <p>Haz clic para elegir una imagen desde tu computadora</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="file-input-hidden"
                                />
                            </div>
                        ) : (
                            <div className="input-wrapper">
                                <FiLink className="input-icon" />
                                <input
                                    type="text"
                                    className="input-field icon-input-field"
                                    placeholder="https://ejemplo.com/auto.png"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {/* VISTA PREVIA DE LA IMAGEN EN TIEMPO REAL CON BOTÓN DE ELIMINAR */}
                    <div className="live-image-preview-container">
                        <div className="preview-header-row">
                            <span className="preview-section-label">Vista Previa de la Imagen</span>
                            {formData.image && (
                                <button
                                    type="button"
                                    className="btn-remove-image"
                                    onClick={handleRemoveImage}
                                    title="Eliminar imagen cargada"
                                >
                                    <FiTrash2 /> Eliminar Imagen
                                </button>
                            )}
                        </div>

                        {formData.image ? (
                            <div className="preview-image-frame">
                                <img src={formData.image} alt="Vista Previa" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        ) : (
                            <div className="no-image-box">
                                <FiImage className="placeholder-icon" />
                                <span>Sin imagen cargada aún</span>
                            </div>
                        )}
                    </div>

                    {/* SWITCH DE ESTADO DISPONIBLE EN 1 SOLO RENGLÓN */}
                    <div className="custom-switch-card">
                        <label className="switch-label">
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                            />
                            <span className="switch-slider" />
                            <div className="switch-text-two-lines">
                                <div className="switch-line-1">
                                    <strong>Vehículo Activo</strong>
                                    <span className="switch-sep">·</span>
                                    <span className="switch-accent">Disponible para Alquilar</span>
                                </div>
                                <div className="switch-line-2">
                                    <small className="switch-desc">Los clientes podrán ver y reservar este auto</small>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* COLUMNA DERECHA: CAMPOS DEL FORMULARIO CON ICONOS DE INICIO / HOME */}
                <div className="form-right-col glass-card">
                    <div className="form-fields-grid">

                        {/* NOMBRE */}
                        <div className="custom-input-group full-width">
                            <label className="custom-label"><FaCar /> Nombre del Auto *</label>
                            <div className="input-wrapper">
                                <FaCar className="input-icon" />
                                <input
                                    type="text"
                                    className="input-field icon-input-field"
                                    placeholder="Ej: BMW X5, Peugeot 208"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* MODELO / CARROCERÍA */}
                        <div className="custom-input-group">
                            <label className="custom-label"><FaCar /> Modelo / Carrocería *</label>
                            <div className="input-wrapper">
                                <FaCar className="input-icon" />
                                <select
                                    className="input-field icon-input-field custom-select"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {CAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* AÑO */}
                        <div className="custom-input-group">
                            <label className="custom-label"><FiCalendar /> Año *</label>
                            <div className="input-wrapper">
                                <FiCalendar className="input-icon" />
                                <input
                                    type="number"
                                    className="input-field icon-input-field"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    min="2000"
                                    max="2030"
                                    required
                                />
                            </div>
                        </div>

                        {/* PRECIO POR DÍA */}
                        <div className="custom-input-group">
                            <label className="custom-label"><FiDollarSign /> Precio por Día ($) *</label>
                            <div className="input-wrapper">
                                <FiDollarSign className="input-icon" />
                                <input
                                    type="number"
                                    className="input-field icon-input-field"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        {/* ASIENTOS */}
                        <div className="custom-input-group">
                            <label className="custom-label"><BsPeopleFill /> Capacidad de Asientos *</label>
                            <div className="input-wrapper">
                                <BsPeopleFill className="input-icon" />
                                <input
                                    type="number"
                                    className="input-field icon-input-field"
                                    value={formData.seats}
                                    onChange={e => setFormData({ ...formData, seats: e.target.value })}
                                    min="1"
                                    max="20"
                                    required
                                />
                            </div>
                        </div>

                        {/* COMBUSTIBLE */}
                        <div className="custom-input-group">
                            <label className="custom-label"><BsFuelPump /> Combustible *</label>
                            <div className="input-wrapper">
                                <BsFuelPump className="input-icon" />
                                <select
                                    className="input-field icon-input-field custom-select"
                                    value={formData.fuel}
                                    onChange={e => setFormData({ ...formData, fuel: e.target.value })}
                                >
                                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* TRANSMISIÓN */}
                        <div className="custom-input-group">
                            <label className="custom-label"><TbManualGearbox /> Transmisión *</label>
                            <div className="input-wrapper">
                                <TbManualGearbox className="input-icon" />
                                <select
                                    className="input-field icon-input-field custom-select"
                                    value={formData.transmission}
                                    onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                                >
                                    {TRANSMISSION_TYPES.map(tr => <option key={tr} value={tr}>{tr}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* UBICACIÓN */}
                        <div className="custom-input-group full-width">
                            <label className="custom-label"><FiMapPin /> Ubicación / Ciudad *</label>
                            <div className="input-wrapper">
                                <FiMapPin className="input-icon" />
                                <select
                                    className="input-field icon-input-field custom-select"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                >
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* DESCRIPCIÓN DETALLADA (OCUPA TODO EL ANCHO DE LA PARTE INFERIOR) */}
                        <div className="custom-input-group full-width description-full-width">
                            <label className="custom-label">Descripción Detallada *</label>
                            <textarea
                                className="input-field custom-textarea"
                                rows="4"
                                placeholder="Detalla características principales, recomendaciones y estado del vehículo..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="form-workspace-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setViewMode('list')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                            {submitting ? <span className="spinner spinner-sm" /> : <><FiCheck /> {editingCar ? 'Guardar Cambios' : 'Registrar Auto'}</>}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default AdminCars;
