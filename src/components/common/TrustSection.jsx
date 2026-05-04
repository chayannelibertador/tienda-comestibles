import { useState, useEffect, useRef } from 'react';
import './TrustSection.css';

const TRUST_ITEMS = [
    {
        id: 1,
        icon: '🛒',
        title: 'Mejor Precio y Calidad',
        text: 'Arme su provista semanal o mensual y ahorre dinero.'
    },
    {
        id: 2,
        icon: '🚚',
        title: 'Envío Puerta a Puerta',
        text: 'Llegamos a la comodidad de su hogar.'
    },
    {
        id: 3,
        icon: '🤝',
        title: 'Compromiso Social',
        text: 'Por cada compra se destinará un 5% en alimentos para quienes más lo necesitan.'
    }
];

export default function TrustSection() {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { threshold: 0.1 });

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    return (
        <section className="trust-section" ref={sectionRef}>
            <div className={`flap-bg-container flap-left ${isVisible ? 'is-visible' : ''}`}>
               <div className="flap-shape bg-slate"></div>
            </div>

            <div className="trust-section__content">
                <div className="section-title-wrapper">
                    <h2 className={`animated-title-text align-left ${isVisible ? 'is-visible' : ''}`}>
                        ¿Por qué elegirnos?
                    </h2>
                </div>

                <div className="trust-section__grid">
                {TRUST_ITEMS.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`trust-card ${isVisible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: `${index * 0.15}s` }}
                    >
                        <div className="trust-card__icon">{item.icon}</div>
                        <h3 className="trust-card__title">{item.title}</h3>
                        <p className="trust-card__text">{item.text}</p>
                    </div>
                ))}
                </div>
            </div>
        </section>
    );
}
