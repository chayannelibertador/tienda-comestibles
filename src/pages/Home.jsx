import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Testimonials from '../components/common/Testimonials';
import TrustSection from '../components/common/TrustSection';
import Marquee from '../components/common/Marquee';
import brandLogo from '../assets/altoquemarket2.png';
import heroCrate from '../assets/hero-crate.png';
import secureDeliveryBanner from '../assets/secure_delivery_banner.png';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const promoRef = useRef(null);
    const [isPromoExpanded, setIsPromoExpanded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                // Expandimos cuando entra y contraemos cuando sale del área visible
                setIsPromoExpanded(entry.isIntersecting);
            },
            { threshold: 0.65 } // Require 65% visibility before expanding
        );

        if (promoRef.current) {
            observer.observe(promoRef.current);
        }

        return () => {
            if (promoRef.current) {
                observer.unobserve(promoRef.current);
            }
        };
    }, []);

    return (
        <div className="home page-enter">
            <Marquee />

            <section className="hero">
                <div className="hero__background-glow"></div>
                
                <div className="hero__container">
                    {/* Left Column: Brand & Value Prop */}
                    <div className="hero__content">
                        <div className="hero__logo-img-container">
                            <img src={brandLogo} alt="Al Toque Market Logo" className="hero__main-logo" />
                        </div>
                        <p className="hero__subtitle" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                            tu supermercado en casa
                        </p>

                        <button className="hero__cta-premium" onClick={() => navigate('/catalog')}>
                            <span className="hero__cta-text">Explorar Tienda</span>
                            <span className="hero__cta-icon">→</span>
                        </button>
                    </div>

                    {/* Right Column: Floating Product */}
                    <div className="hero__visual">
                        <div className="hero__visual-plate"></div>
                        <img
                            src={heroCrate}
                            alt="Cajón de verduras extremadamente fresco"
                            className="hero__crate-img"
                        />
                    </div>
                </div>
            </section>

            {/* Promo Banner Section */}
            <section className={`promo-section ${isPromoExpanded ? 'is-expanded' : ''}`} ref={promoRef}>
                <div className="promo-glass-card">
                    <img 
                        src={secureDeliveryBanner} 
                        alt="Entrega Segura y Confiable" 
                        className="promo-glass-img" 
                    />
                    <div className="promo-glass-overlay"></div>
                    
                    {/* Trust Badge that fades in after expansion */}
                    <div className="promo-trust-badge">
                        <span className="promo-trust-icon">🛡️</span>
                        <div className="promo-trust-text">
                            <strong>Recibilo en casa.</strong>
                            <span>Sin vueltas.</span>
                        </div>
                    </div>
                </div>
            </section>

            <TrustSection />
            <Testimonials />
        </div>
    );
}
