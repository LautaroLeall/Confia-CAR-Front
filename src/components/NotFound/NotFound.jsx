// src/components/NotFound/NotFound.jsx
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => (
    <div className="notfound-page">
        <div className="notfound-bg" />
        <div className="notfound-content animate-slide-up">
            <div className="notfound-icon">
                <FaCar />
            </div>
            <h1 className="notfound-code">404</h1>
            <h2 className="notfound-title">Página no encontrada</h2>
            <p className="notfound-desc">
                Parece que este camino no lleva a ningún lado.<br />
                Volvé al inicio y seguí explorando.
            </p>
            <Link to="/inicio" className="btn btn-primary btn-lg">
                <FiArrowLeft /> Volver al inicio
            </Link>
        </div>
    </div>
);

export default NotFound;
