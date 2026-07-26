// src/components/Background/Background.jsx
import './Background.css';
import video1 from '../../assets/container/video1.mp4';
import image1 from '../../assets/container/image1.png';
import image2 from '../../assets/container/image2.png';
import image3 from '../../assets/container/image3.png';

const Background = ({ playStatus, heroCount }) => {
    if (playStatus) {
        return (
            <video className='background fade-in' autoPlay loop muted playsInline>
                <source src={video1} type="video/mp4" />
            </video>
        );
    }
    else if (heroCount === 0) {
        return <img src={image1} alt="Fondo ConfiaCAR 1" className='background' width="1920" height="1080" loading="eager" />;
    }
    else if (heroCount === 1) {
        return <img src={image2} alt="Fondo ConfiaCAR 2" className='background' width="1920" height="1080" loading="lazy" />;
    }
    else if (heroCount === 2) {
        return <img src={image3} alt="Fondo ConfiaCAR 3" className='background' width="1920" height="1080" loading="lazy" />;
    }
};

export default Background;
