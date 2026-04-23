import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './CookieBanner.css';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Show with a slight delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner-overlay">
            <div className="cookie-banner">
                <div className="cookie-content">
                    <div className="cookie-icon">🍪</div>
                    <div className="cookie-text">
                        <p>
                            Utilizamos herramientas propias y de terceros para mejorar tu experiencia.
                            Al navegar por <strong>aLToQueMaRKeT</strong>, aceptas nuestra <Link to="/privacy">Política de Privacidad</Link>.
                        </p>
                    </div>
                </div>
                <div className="cookie-actions">
                    <Button variant="primary" size="sm" onClick={handleAccept}>
                        Entendido
                    </Button>
                </div>
            </div>
        </div>
    );
}
