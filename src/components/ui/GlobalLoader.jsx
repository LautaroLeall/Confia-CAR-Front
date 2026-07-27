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

        // Temporizador de seguridad máximo (12s) para nunca congelar la app
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

    if (isBackendReady) return children;

    return (
        <div className={`cc-global-loader ${isFadingOut ? 'fade-out' : ''}`}>
            {/* Fondo con rejilla cibernética de alta precisión */}
            <div className="cc-loader-bg-grid" />

            {/* Tacómetro / Anillo Velocímetro Automotriz */}
            <div className="cc-speedometer-wrapper">
                {/* Anillos concéntricos de energía */}
                <div className="cc-speedo-outer-glow" />
                <div className="cc-speedo-dial" />
                <div className="cc-speedo-sweep" />

                {/* Logo central de Confia-CAR con destello metálico */}
                <div className="cc-speedo-center">
                    <img
                        src={logoSvg}
                        alt="Confia CAR Logo"
                        className="cc-speedo-logo"
                    />
                </div>
            </div>

            {/* Marca de texto y estado */}
            <div className="cc-loader-brand">
                <h2 className="cc-loader-title">
                    Confia<span className="cc-brand-accent">CAR</span>
                </h2>
                <p className="cc-loader-status">
                    Encendiendo motores<span className="cc-dots-animation">...</span>
                </p>
            </div>

            {/* Barra de velocidad neón */}
            <div className="cc-speed-bar-container">
                <div className="cc-speed-bar-fill" />
            </div>
        </div>
    );
};

export default GlobalLoader;
