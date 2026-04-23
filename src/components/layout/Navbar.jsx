import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import './Navbar.css';
import Button from '../common/Button';
import Badge from '../common/Badge';
import brandLogo from '../../assets/altoquemarket2.png';

export default function Navbar() {
    const { totalItems, clearSession } = useCart();
    const { user, logout } = useUser();
    const location = useLocation();
    const isHome = location.pathname === '/';

    const handleLogout = () => {
        clearSession();
        logout();
    };

    return (
        <nav className="navbar">
            <div className="navbar__container">
                {!isHome ? (
                    <Link to="/" className="navbar__logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={brandLogo} alt="Al Toque Market" style={{ height: '40px', width: 'auto' }} />
                    </Link>
                ) : (
                    <div className="navbar__logo-placeholder" style={{ width: '150px' }}></div>
                )}
                <div className="navbar__spacer"></div>
                <div className="navbar__actions">
                    {user ? (
                        <div className="navbar__user" style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="mr-2">Hola, <strong>{user.name}</strong></span>

                            <Button variant="outline" className="mr-2 btn-logout" onClick={handleLogout}>Salir</Button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="outline" className="mr-2">Iniciar Sesión</Button>
                        </Link>
                    )}
                    {user && (
                        <Link to="/cart" className="navbar__cart-link">
                            <span className="cart-icon">🛒</span>
                            <span className="cart-text" style={{ color: '#1E293B' }}>Carrito</span>
                            <span className="cart-count">{totalItems}</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
