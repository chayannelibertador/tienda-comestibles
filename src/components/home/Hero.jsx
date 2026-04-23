import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import heroCrate from '../../assets/hero-crate.png';
import brandLogo from '../../assets/altoquemarket2.png';
import './Hero.css';

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="hero-logo-img-container" style={{ marginBottom: '1rem' }}>
                    <img src={brandLogo} alt="Al Toque Market" className="hero-main-logo" />
                </div>
                <p className="hero-subtitle">tu supermercado en casa</p>

                <div className="hero-cta-container">
                    <Button
                        className="btn-hero"
                        onClick={() => navigate('/catalog')}
                    >
                        IR A LA TIENDA <span className="cart-icon">🛒</span>
                    </Button>
                </div>
            </div>

            <div className="hero-image-container">
                <img
                    src={heroCrate}
                    alt="Cajón de verduras y frutas frescas"
                    className="hero-image"
                />
            </div>
        </section>
    );
}
