import { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export function useFavorites() {
    return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]);

    const addFavorite = (product) => {
        setFavorites(prev => {
            const productId = product._id || product.id;
            if (!prev.find(p => (p._id || p.id) === productId)) {
                return [...prev, product];
            }
            return prev;
        });
    };

    const removeFavorite = (productId) => {
        setFavorites(prev => prev.filter(p => (p._id || p.id) !== productId));
    };

    const isFavorite = (productId) => {
        return favorites.some(p => (p._id || p.id) === productId);
    };

    const toggleFavorite = (product) => {
        const productId = product._id || product.id;
        if (isFavorite(productId)) {
            removeFavorite(productId);
        } else {
            addFavorite(product);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}
