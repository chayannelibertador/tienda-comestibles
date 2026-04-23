import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import BrandIcon from '../common/BrandIcon';
import './Footer.css';

export default function Footer() {
    const { settings } = useSettings();

    return (
        <footer className="footer">
            <div className="footer__content">
                <div className="footer__grid">
                    <div className="footer__col">
                        <h3 className="footer__brand">
                            <BrandIcon className="footer__brand-icon" />
                            <div className="footer__brand-text">
                                <span style={{ color: '#ff7300' }}>ALTOQUE</span>
                                <span style={{ color: '#a2d348' }}>MARKET</span>
                            </div>
                        </h3>
                        <p>Tu supermercado de confianza en Libertador San Martín. Productos frescos y de calidad con entregas rápidas al toque.</p>
                        <div className="social-links">
                            {settings.instagram && (
                                <a href={settings.instagram} target="_blank" rel="noopener noreferrer">📷 Instagram</a>
                            )}
                            {settings.facebook && (
                                <a href={settings.facebook} target="_blank" rel="noopener noreferrer">👍 Facebook</a>
                            )}
                        </div>
                    </div>

                    <div className="footer__col">
                        <h4>Enlaces Rápidos</h4>
                        <ul>
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/catalog">Catálogo</Link></li>
                            <li><Link to="/favorites">Favoritos</Link></li>
                            <li><Link to="/privacy">Política de Privacidad</Link></li>
                            <li><Link to="/terms">Términos y Condiciones</Link></li>
                            <li><Link to="/contact">Contáctanos</Link></li>
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h4>Contacto</h4>
                        <ul>
                            <li>📞 {settings.phone}</li>
                            <li>📧 {settings.email}</li>
                            <li>📍 {settings.address}</li>
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h4>Medios de Pago</h4>
                        <div className="payment-icons">
                            <span title="Visa">💳</span>
                            <span title="Mastercard">💳</span>
                            <span title="PayPal">🅿️</span>
                            <span title="Efectivo">💵</span>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} <span style={{ color: '#ff7300', fontWeight: 'bold' }}>aLToQue</span><span style={{ color: '#a2d348', fontWeight: 'bold' }}>MaRKeT</span>. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
