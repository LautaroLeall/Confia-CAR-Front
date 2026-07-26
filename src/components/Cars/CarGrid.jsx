// src/components/Cars/CarGrid.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    FiFilter, FiX, FiSearch, FiMapPin, FiTruck, FiZap,
    FiSettings, FiRotateCcw, FiChevronDown
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import CarCard from './CarCard';
import { SkeletonCard } from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import api from '../../services/api';
import './Cars.css';

const BODY_TYPES = ['Todos', 'SUV', 'Sedán', 'Hatchback', 'Pick-up', 'Coupé', 'Minivan', 'Deportivo'];
const CITIES = ['Todas', 'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Mar del Plata', 'Salta', 'Tucumán', 'Bariloche'];
const FUELS = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Nafta / Gasolina', value: 'Gasoline' },
    { label: 'Diésel', value: 'Diesel' },
    { label: 'Eléctrico', value: 'Electric' },
    { label: 'Híbrido', value: 'Hybrid' },
];
const TRANSMISSIONS = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Automática', value: 'Automatic' },
    { label: 'Manual', value: 'Manual' },
];

// Helper para normalizar cadenas (remueve acentos, guiones y mayúsculas)
const normalizeStr = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
};

const CarGrid = () => {
    const location = useLocation();

    // Estado reactivo para la búsqueda inicial realizada desde /inicio
    const [activeSearch, setActiveSearch] = useState(() => ({
        location: location.state?.location || '',
        pickupDate: location.state?.pickupDate || '',
        returnDate: location.state?.returnDate || ''
    }));

    const [cars, setCars] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Categoría de filtro activa (null = plegado/cerrado, 'type', 'location', 'fuel', 'transmission')
    const [activeCategory, setActiveCategory] = useState(null);

    // Estados de filtros seleccionados
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedLocation, setSelectedLocation] = useState(location.state?.location || 'Todas');
    const [selectedFuel, setSelectedFuel] = useState('Todos');
    const [selectedTransmission, setSelectedTransmission] = useState('Todas');
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

    // Fetch dinámico de autos en backend (reacciona a la búsqueda por ubicación y fechas)
    useEffect(() => {
        const fetchCars = async () => {
            try {
                let url = '/api/cars?';
                if (activeSearch.location) url += `location=${encodeURIComponent(activeSearch.location)}&`;
                if (activeSearch.pickupDate) url += `pickUpDate=${encodeURIComponent(activeSearch.pickupDate)}&`;
                if (activeSearch.returnDate) url += `dropOffDate=${encodeURIComponent(activeSearch.returnDate)}&`;

                const { data } = await api.get(url);
                setCars(data);
            } catch (err) {
                console.error('Error cargando autos:', err.message);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchCars();
    }, [activeSearch.location, activeSearch.pickupDate, activeSearch.returnDate]);

    // Abrir o Plegar/Cerrar panel de categoría al hacer clic
    const handleCategoryToggle = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null); // Cerrar si ya está activa
        } else {
            setActiveCategory(category); // Abrir nueva categoría
        }
    };

    // Cambiar ciudad en los botones de filtro
    const handleLocationSelect = (city) => {
        setSelectedLocation(city);
        if (city === 'Todas') {
            setActiveSearch(prev => ({ ...prev, location: '' }));
        } else {
            setActiveSearch(prev => ({ ...prev, location: city }));
        }
    };

    // Reiniciar todos los filtros y limpiar el banner de búsqueda
    const resetFilters = () => {
        setSelectedType('Todos');
        setSelectedLocation('Todas');
        setSelectedFuel('Todos');
        setSelectedTransmission('Todas');
        setShowOnlyAvailable(false);
        setSearch('');
        setActiveCategory(null);
        setActiveSearch({ location: '', pickupDate: '', returnDate: '' });
        window.history.replaceState({}, document.title);
    };

    // Limpiar banner de búsqueda de inicio
    const clearSearchBanner = () => {
        setActiveSearch({ location: '', pickupDate: '', returnDate: '' });
        setSelectedLocation('Todas');
        window.history.replaceState({}, document.title);
    };

    // Lógica de filtrado multicriterio con normalización
    const filtered = cars.filter(car => {
        const normSearch = normalizeStr(search);
        const matchSearch = !normSearch ||
            normalizeStr(car.name).includes(normSearch) ||
            normalizeStr(car.location).includes(normSearch) ||
            normalizeStr(car.type).includes(normSearch);

        const matchType = selectedType === 'Todos' || normalizeStr(car.type) === normalizeStr(selectedType);
        const matchLocation = selectedLocation === 'Todas' || normalizeStr(car.location) === normalizeStr(selectedLocation);
        const matchFuel = selectedFuel === 'Todos' || normalizeStr(car.fuel) === normalizeStr(selectedFuel);
        const matchTransmission = selectedTransmission === 'Todas' || normalizeStr(car.transmission) === normalizeStr(selectedTransmission);
        const matchAvail = !showOnlyAvailable || car.isAvailable;

        return matchSearch && matchType && matchLocation && matchFuel && matchTransmission && matchAvail;
    });

    const isFilterActive =
        selectedType !== 'Todos' ||
        selectedLocation !== 'Todas' ||
        selectedFuel !== 'Todos' ||
        selectedTransmission !== 'Todas' ||
        showOnlyAvailable ||
        search !== '' ||
        activeSearch.location !== '' ||
        activeSearch.pickupDate !== '';

    const hasBanner = !!(activeSearch.location || activeSearch.pickupDate);
    const currentFilterKey = `${selectedLocation}-${selectedType}-${selectedFuel}-${selectedTransmission}-${search}-${showOnlyAvailable}`;

    return (
        <div className="cargrid-page page-container">
            <div className="container">

                {/* BANNER DE BÚSQUEDA PREVIA CON BOTÓN DE CERRAR */}
                {hasBanner && (
                    <div className="search-banner glass-card animate-slide-down">
                        <div className="search-banner-content">
                            <FiSearch />
                            <span>
                                Mostrando autos
                                {activeSearch.location && <strong> en {activeSearch.location}</strong>}
                                {activeSearch.pickupDate && <> del <strong>{activeSearch.pickupDate}</strong></>}
                                {activeSearch.returnDate && <> al <strong>{activeSearch.returnDate}</strong></>}
                            </span>
                        </div>
                        <button
                            className="search-banner-close-btn"
                            onClick={clearSearchBanner}
                            title="Quitar filtro de búsqueda"
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                {/* HEADER + BUSCADOR */}
                <div className="cargrid-header">
                    <div>
                        <h1 className="section-title">Autos Disponibles</h1>
                        <p className="section-subtitle">
                            {initialLoading ? '' : `${filtered.length} vehículo${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    {/* BUSCADOR */}
                    <div className="input-wrapper cargrid-search">
                        <FiSearch className="input-icon" />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Buscar por marca, modelo o ciudad..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="input-icon-right" onClick={() => setSearch('')}>
                                <FiX />
                            </button>
                        )}
                    </div>
                </div>

                {/* SECTOR DE FILTROS ANIMADO Y PLEGABLE */}
                <div className="filter-system-wrapper glass-card animate-fade-in">
                    {/* BARRA DE NAVEGACIÓN DE CATEGORÍAS DE FILTRO */}
                    <div className="filter-category-tabs">
                        <button
                            className={`category-tab ${activeCategory === 'type' ? 'active' : ''}`}
                            onClick={() => handleCategoryToggle('type')}
                        >
                            <FiTruck /> Carrocería / Tipo
                            {selectedType !== 'Todos' && <span className="category-dot" />}
                            <FiChevronDown className="category-chevron" />
                        </button>

                        <button
                            className={`category-tab ${activeCategory === 'location' ? 'active' : ''}`}
                            onClick={() => handleCategoryToggle('location')}
                        >
                            <FiMapPin /> Ubicación / Ciudad
                            {selectedLocation !== 'Todas' && <span className="category-dot" />}
                            <FiChevronDown className="category-chevron" />
                        </button>

                        <button
                            className={`category-tab ${activeCategory === 'fuel' ? 'active' : ''}`}
                            onClick={() => handleCategoryToggle('fuel')}
                        >
                            <FiZap /> Combustible
                            {selectedFuel !== 'Todos' && <span className="category-dot" />}
                            <FiChevronDown className="category-chevron" />
                        </button>

                        <button
                            className={`category-tab ${activeCategory === 'transmission' ? 'active' : ''}`}
                            onClick={() => handleCategoryToggle('transmission')}
                        >
                            <FiSettings /> Transmisión
                            {selectedTransmission !== 'Todas' && <span className="category-dot" />}
                            <FiChevronDown className="category-chevron" />
                        </button>

                        {/* TOGGLE SOLO DISPONIBLES */}
                        <button
                            className={`type-filter-btn avail-toggle ${showOnlyAvailable ? 'active' : ''}`}
                            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                        >
                            <FiFilter size={14} />
                            Solo disponibles
                        </button>

                        {/* REINICIAR FILTROS */}
                        {isFilterActive && (
                            <button className="btn-reset-filters animate-scale-in" onClick={resetFilters}>
                                <FiRotateCcw size={13} /> Limpiar filtros
                            </button>
                        )}
                    </div>

                    {/* OPCIONES DE FILTRO DESPLEGABLES CON ANIMACIÓN Y CIERRE PLEGABLE */}
                    {activeCategory && (
                        <div className="filter-options-content">
                            {/* CATEGORÍA 1: CARROCERÍA / TIPO */}
                            {activeCategory === 'type' && (
                                <div className="type-filters animate-slide-down" key="type-panel">
                                    {BODY_TYPES.map(type => (
                                        <button
                                            key={type}
                                            className={`type-filter-btn ${selectedType === type ? 'active' : ''}`}
                                            onClick={() => setSelectedType(type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* CATEGORÍA 2: UBICACIÓN / CIUDAD */}
                            {activeCategory === 'location' && (
                                <div className="type-filters animate-slide-down" key="location-panel">
                                    {CITIES.map(city => (
                                        <button
                                            key={city}
                                            className={`type-filter-btn ${selectedLocation === city ? 'active' : ''}`}
                                            onClick={() => handleLocationSelect(city)}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* CATEGORÍA 3: COMBUSTIBLE */}
                            {activeCategory === 'fuel' && (
                                <div className="type-filters animate-slide-down" key="fuel-panel">
                                    {FUELS.map(fuel => (
                                        <button
                                            key={fuel.value}
                                            className={`type-filter-btn ${selectedFuel === fuel.value ? 'active' : ''}`}
                                            onClick={() => setSelectedFuel(fuel.value)}
                                        >
                                            {fuel.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* CATEGORÍA 4: TRANSMISIÓN */}
                            {activeCategory === 'transmission' && (
                                <div className="type-filters animate-slide-down" key="trans-panel">
                                    {TRANSMISSIONS.map(trans => (
                                        <button
                                            key={trans.value}
                                            className={`type-filter-btn ${selectedTransmission === trans.value ? 'active' : ''}`}
                                            onClick={() => setSelectedTransmission(trans.value)}
                                        >
                                            {trans.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* GRID DE AUTOS CON WRAPPER DE TRANSICIÓN SUAVE Y MIN-HEIGHT ESTABLE */}
                <div className="cargrid-results-wrapper">
                    {initialLoading ? (
                        <div className="cars-grid">
                            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state-animated-wrapper animate-fade-in" key={currentFilterKey}>
                            <EmptyState
                                icon={<FaCar />}
                                title="No encontramos vehículos"
                                description="Prueba cambiando los criterios de búsqueda o limpiando los filtros seleccionados."
                            />
                        </div>
                    ) : (
                        <div className="cars-grid animate-fade-in" key={currentFilterKey}>
                            {filtered.map(car => <CarCard key={car._id || car.id} car={car} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarGrid;
