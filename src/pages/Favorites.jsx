import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './Favorites.css';

export default function Favorites() {
    const navigate = useNavigate();
    const { favorites, removeFavorite } = useFavorites();
    const { addToCart } = useCart();

    return (
        <div className="favorites-page page-enter">
            <h1 className="favorites-title">Mis Favoritos ❤️</h1>

            {favorites.length === 0 ? (
                <div className="favorites-empty">
                    <h2>No tienes favoritos aún</h2>
                    <p>Agrega productos a tu lista para encontrarlos más rápido.</p>
                    <Button variant="primary" onClick={() => navigate('/catalog')}>
                        Explorar Catálogo
                    </Button>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map(product => (
                        <Card key={product._id || product.id} className="product-card hover-lift" product={product}>
                            <div
                                className="product-image"
                                onClick={() => navigate(`/product/${product._id || product.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {product.image}
                            </div>
                            <div className="product-info">
                                <h3
                                    className="product-name"
                                    onClick={() => navigate(`/product/${product._id || product.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {product.name}
                                </h3>
                                <p className="product-category">{product.category}</p>
                                <div className="product-bottom">
                                    <span className="product-price">${product.price.toFixed(2)}</span>
                                    <div className="card-actions">
                                        <Button
                                            variant="primary"
                                            className="btn-sm"
                                            onClick={() => addToCart(product)}
                                        >
                                            Agregar al carrito
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
