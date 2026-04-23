import { useFavorites } from '../../context/FavoritesContext';
import './Card.css';

export default function Card({ children, className, product }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFav = product ? isFavorite(product._id || product.id) : false;

    return (
        <div className={`card ${className || ''}`}>
            {product && (
                <button
                    className={`card__fav-btn ${isFav ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product);
                    }}
                    title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                    {isFav ? '❤️' : '🤍'}
                </button>
            )}
            {children}
        </div>
    );
}
