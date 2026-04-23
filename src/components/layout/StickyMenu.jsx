import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import './StickyMenu.css';

const CATEGORIES = ['Todos', 'Express', 'Frutas', 'Verduras', 'Panadería', 'Lácteos', 'Bebidas'];

export default function StickyMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login, logout, isAdmin } = useUser();
    const { totalItems, clearSession } = useCart();

    const [activeTab, setActiveTab] = useState(null);

    // Si estamos en home, no mostrar nada (diseño limpio)
    if (location.pathname === '/') return null;

    const toggleTab = (tab) => {
        if (activeTab === tab) {
            setActiveTab(null);
        } else {
            setActiveTab(tab);
        }
    };

    const handleCategoryClick = (cat) => {
        setActiveTab(null);
        if (cat === 'Todos') navigate('/catalog');
        else navigate(`/catalog?category=${cat}`);
    };

    // Items centrales del menú (eliminamos Sesión porque va a la derecha)
    const menuItems = [
        { label: 'Categorías', key: 'categories' },
        { label: 'Favoritos', key: 'favorites' },
        { label: 'Compras', key: 'purchases' }
    ];

    return (
        <div className="sticky-menu">
            <div className="sticky-menu__bar">
                {/* IZQUIERDA: LOGO */}
                <Link to="/" className="sticky-menu__logo" onClick={() => setActiveTab(null)}>
                    <span style={{ color: '#ff7300' }}>ALTOQUE</span>
                    <span style={{ color: '#a2d348' }}>MARKET</span>
                </Link>

                {/* CENTRO: MENÚ */}
                <div className="sticky-menu__center">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={`sticky-menu__btn ${activeTab === item.key ? 'active' : ''}`}
                            onClick={() => {
                                if (item.key === 'favorites') {
                                    setActiveTab(null);
                                    navigate('/favorites');
                                } else {
                                    toggleTab(item.key);
                                }
                            }}
                        >
                            {item.label} {item.key !== 'favorites' && <span className="arrow">▼</span>}
                        </button>
                    ))}
                </div>

                {/* DERECHA: ACCIONES USUARIO + CARRITO */}
                <div className="sticky-menu__actions">
                    {user && (
                        <Link to="/cart" onClick={() => setActiveTab(null)}>
                            <Button variant="primary" className="menu-action-btn">
                                🛒 <Badge variant="secondary" className="ml-1">{totalItems}</Badge>
                            </Button>
                        </Link>
                    )}

                    {user ? (
                        <div className="user-menu-inline">
                            <span className="user-welcome">Hola, {user.name}</span>
                            <div className="user-buttons">
                                <Button variant="outline" className="menu-action-btn small" onClick={() => navigate('/profile')}>
                                    Perfil
                                </Button>
                                <Button
                                    variant="outline"
                                    className="menu-action-btn small btn-logout"
                                    onClick={() => {
                                        clearSession();
                                        logout();
                                    }}
                                >
                                    Salir
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" onClick={() => setActiveTab(null)}>
                            <Button variant="outline" className="menu-action-btn">
                                Iniciar Sesión
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* CONTENIDO DESPLEGABLE (Categorías y Compras) */}
            {activeTab && (
                <div className="sticky-menu__content">
                    {activeTab === 'categories' && (
                        <div className="menu-grid">
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => handleCategoryClick(cat)} className="menu-item">
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div className="menu-list">
                            <p className="empty-msg">Revisa el estado de tus pedidos.</p>
                            <Button variant="primary" onClick={() => { setActiveTab(null); navigate('/my-orders'); }} className="full-width">
                                Ver Mis Pedidos
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
