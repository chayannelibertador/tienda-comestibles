import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Testimonials from '../components/common/Testimonials';
import TrustSection from '../components/common/TrustSection';
import Marquee from '../components/common/Marquee';
import BrandIcon from '../components/common/BrandIcon';
import heroProducts from '../assets/hero_products.png';
import heroProductsV2 from '../assets/hero_products_v2.png';
import heroProductsV3 from '../assets/hero_products_v3.png';
import heroCrate from '../assets/hero-crate.png';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const heroImages = [
        heroProductsV3,
        heroProducts,
        heroProductsV2,
        heroCrate
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [heroImages.length]);

    return (
        <div className="home page-enter">
            <Marquee />

            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title">
                        <BrandIcon className="hero__brand-icon" />
                        <span style={{ color: '#ff7300' }}>ALTOQUE</span>
                        <span style={{ color: '#a2d348' }}>MARKET</span>
                    </h1>

                    <button className="hero__cta" onClick={() => navigate('/catalog')}>
                        <svg className="hero__cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        IR A LA TIENDA
                    </button>
                </div>
                <div className="hero__image">
                    {heroImages.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Productos Altoque ${index + 1}`}
                            className={`hero__product-img ${index === currentImageIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </section>

            <TrustSection />
            <Testimonials />
        </div>
    );
}
