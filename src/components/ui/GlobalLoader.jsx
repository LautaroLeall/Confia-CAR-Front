// src/components/ui/GlobalLoader.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import logoSvg from '../../assets/logo/logo.svg';
import './GlobalLoader.css';

const GlobalLoader = ({ children }) => {
    const [isBackendReady, setIsBackendReady] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const retriesRef = useRef(0);

    useEffect(() => {
        let isMounted = true;
        let timeoutId = null;

        const checkBackend = async () => {
            try {
                const { data } = await api.get('/health');
                if (data?.status === 'ok' && isMounted) {
                    // Backend respondió — iniciar fade out
                    setIsFadingOut(true);
                    // Esperar la animación de fade (600ms) antes de mostrar la app
                    timeoutId = setTimeout(() => {
                        if (isMounted) setIsBackendReady(true);
                    }, 600);
                }
            } catch {
                // Backend no responde — reintentar en 3 segundos
                retriesRef.current += 1;
                if (isMounted) {
                    timeoutId = setTimeout(checkBackend, 3000);
                }
            }
        };

        checkBackend();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    // Si el backend ya respondió, mostrar la app directamente
    if (isBackendReady) return children;

    return (
        <div className={`global-loader ${isFadingOut ? 'fade-out' : ''}`}>
            {/* Logo con anillos orbitales */}
            <div className="global-loader-logo-wrapper">
                <div className="global-loader-ring" />
                <div className="global-loader-ring-2" />
                <img
                    src={logoSvg}
                    alt="Confia CAR"
                    className="global-loader-logo"
                />
            </div>

            {/* Texto */}
            <p className="global-loader-text">Preparando tu experiencia...</p>
            <p className="global-loader-subtext">Esto puede tomar unos segundos</p>

            {/* Barra de progreso */}
            <div className="global-loader-bar-track">
                <div className="global-loader-bar-fill" />
            </div>
        </div>
    );
};

export default GlobalLoader;
