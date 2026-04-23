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
    const titleRef = useRef(null);
    const [isTitleVisible, setIsTitleVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsTitleVisible(entry.isIntersecting);
        }, { threshold: 0.1 });

        if (titleRef.current) observer.observe(titleRef.current);
        return () => { if (titleRef.current) observer.unobserve(titleRef.current); };
    }, []);

    return (
        <section className="trust-section">
            <div className={`flap-bg-container flap-left ${isTitleVisible ? 'is-visible' : ''}`}>
               <div className="flap-shape bg-slate"></div>
            </div>

            <div className="trust-section__content">
                <div className="section-title-wrapper" ref={titleRef}>
                    <h2 className={`animated-title-text align-left ${isTitleVisible ? 'is-visible' : ''}`}>
                        ¿Por qué elegirnos?
                    </h2>
                </div>

                <div className="trust-section__grid">
                {TRUST_ITEMS.map((item) => (
                    <div key={item.id} className="trust-card">
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
