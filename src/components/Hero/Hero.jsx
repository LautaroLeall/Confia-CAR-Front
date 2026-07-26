// src/components/Hero/Hero.jsx
import { Link } from 'react-router-dom';
import './Hero.css';
import arrow_btn from '../../assets/container/arrow_btn.png';
import play_icon from '../../assets/container/play_icon.png';
import pause_icon from '../../assets/container/pause_icon.png';

const Hero = ({ heroData, heroCount, setHeroCount, playStatus, setPlayStatus }) => {
    return (
        <div className='hero'>
            <h1 className="hero-text">
                <span className="hero-line-1">{heroData.text1}</span>
                <br />
                <span className="hero-line-2">{heroData.text2}</span>
            </h1>

            <div className="hero-explore">
                <p className="m-0">
                    Explora los autos disponibles
                </p>
                <Link to="/inicio" className="text-decoration-none" aria-label="Explora los autos disponibles">
                    <img src={arrow_btn} alt="Explorar autos" width="50" height="50" loading="eager" />
                </Link>
            </div>

            <div className="hero-dot-play">
                <ul className="hero-dots">
                    <li className={heroCount === 0 ? "hero-dot orange" : "hero-dot"} onClick={() => setHeroCount(0)}></li>
                    <li className={heroCount === 1 ? "hero-dot orange" : "hero-dot"} onClick={() => setHeroCount(1)}></li>
                    <li className={heroCount === 2 ? "hero-dot orange" : "hero-dot"} onClick={() => setHeroCount(2)}></li>
                </ul>
                <div className="hero-play">
                    <img src={playStatus ? pause_icon : play_icon} alt="Ver video" width="60" height="60" onClick={() => setPlayStatus(!playStatus)} />
                    <p className='m-0'>Ver el video</p>
                </div>
            </div>
        </div>
    );
};

export default Hero;
