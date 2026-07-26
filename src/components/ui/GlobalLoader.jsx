// src/components/ui/GlobalLoader.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import logoSvg from '../../assets/logo/logo.svg';
import './GlobalLoader.css';

const GlobalLoader = ({ children }) => {
    const [isBackendReady, setIsBackendReady] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const isReadyRef = useRef(false);
    const retriesRef = useRef(0);

    useEffect(() => {
        let isMounted = true;
        let timeoutId = null;

        const unlockApp = () => {
            if (!isMounted || isReadyRef.current) return;
            isReadyRef.current = true;
            setIsFadingOut(true);
            timeoutId = setTimeout(() => {
                if (isMounted) setIsBackendReady(true);
            }, 600);
        };

        // Temporizador de seguridad máximo (12s) para nunca congelar la app si hay bloqueadores o fallos
        const safetyTimer = setTimeout(() => {
            if (isMounted && !isReadyRef.current) {
                unlockApp();
            }
        }, 12000);

        const checkBackend = async () => {
            try {
                const { data } = await api.get('/');
                if (data?.status === 'ok' && isMounted) {
                    clearTimeout(safetyTimer);
                    unlockApp();
                }
            } catch {
                retriesRef.current += 1;
                // Si falla más de 5 veces o hay error de cliente, desbloquear igual
                if (retriesRef.current >= 5) {
                    clearTimeout(safetyTimer);
                    unlockApp();
                } else if (isMounted && !isReadyRef.current) {
                    timeoutId = setTimeout(checkBackend, 2500);
                }
            }
        };

        checkBackend();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
            if (safetyTimer) clearTimeout(safetyTimer);
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
