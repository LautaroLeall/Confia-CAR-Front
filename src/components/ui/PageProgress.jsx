// src/components/ui/PageProgress.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageProgress.css';

const PageProgress = () => {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(false);

    useEffect(() => {
        // Al cambiar de ruta, scroll al top e iniciar la barra de carga
        window.scrollTo(0, 0);
        setActive(true);
        setProgress(30);

        const timer1 = setTimeout(() => setProgress(70), 120);
        const timer2 = setTimeout(() => setProgress(90), 250);
        const timer3 = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setActive(false);
                setProgress(0);
            }, 200);
        }, 400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [location.pathname, location.search]);

    if (!active && progress === 0) return null;

    return (
        <div className="top-progress-container">
            <div
                className="top-progress-bar"
                style={{
                    transform: `scaleX(${progress / 100})`,
                    transformOrigin: 'left',
                    opacity: progress === 100 ? 0 : 1
                }}
            />
            <div className="top-progress-spinner" />
        </div>
    );
};

export default PageProgress;
