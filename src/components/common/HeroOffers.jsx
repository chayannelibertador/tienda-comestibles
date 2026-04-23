import { useState, useEffect } from 'react';
import './HeroOffers.css';

const OFFERS = [
    { id: 1, text: '¡20% OFF en Frutas!', image: '🍎', sub: 'Solo por hoy' },
    { id: 2, text: 'Pan Recién Horneado', image: '🥖', sub: 'Calidad Artesanal' },
    { id: 3, text: 'Lácteos Frescos', image: '🥛', sub: 'Directo de granja' },
    { id: 4, text: 'Verduras de Estación', image: '🥕', sub: 'Cosechadas ayer' }
];

export default function HeroOffers() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hero-offers">
            <div className="hero-offers__container">
                {OFFERS.map((offer, index) => {
                    let className = 'hero-offer';
                    if (index === currentIndex) className += ' active';
                    else if (index === (currentIndex - 1 + OFFERS.length) % OFFERS.length) className += ' exit';

                    return (
                        <div key={offer.id} className={className}>
                            <div className="hero-offer__image">{offer.image}</div>
                            <div className="hero-offer__info">
                                <h3 className="hero-offer__title">{offer.text}</h3>
                                <p className="hero-offer__sub">{offer.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
