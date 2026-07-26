// src/container/Container.jsx
import { useState, useEffect } from 'react';
import Background from '../components/Background/Background';
import Hero from '../components/Hero/Hero';
import './Container.css';

// Página principal — ocupa 100vh exacto, sin scroll
const Container = () => {
    const heroData = [
        { text1: "Elegí", text2: "Tu camino" },
        { text1: "Manejá", text2: "La diferencia" },
        { text1: "Viví", text2: "La libertad" },
    ];

    const [heroCount, setHeroCount] = useState(0);
    const [playStatus, setPlayStatus] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroCount(count => count === 2 ? 0 : count + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container-page">
            <Background playStatus={playStatus} heroCount={heroCount} />
            <Hero
                setPlayStatus={setPlayStatus}
                heroData={heroData[heroCount]}
                heroCount={heroCount}
                setHeroCount={setHeroCount}
                playStatus={playStatus}
            />
        </div>
    );
};

export default Container;
