import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './MobileCatalogNav.css';

const CATEGORIES = ['Todos', 'Express', 'Frutas', 'Verduras', 'Panadería', 'Lácteos', 'Bebidas'];

export default function MobileCatalogNav({
    searchTerm,
    onSearch,
    priceRange,
    onPriceChange,
    currentCategory,
    onCategoryChange
}) {
    const navigate = useNavigate();
    const { totalItems } = useCart();
    const cartCount = totalItems;

    const [activeTab, setActiveTab] = useState(null); // 'categories', 'filters', 'search'

    const toggleTab = (tab) => {
        if (activeTab === tab) {
            setActiveTab(null);
        } else {
            setActiveTab(tab);
        }
    };

    const handleCategoryClick = (cat) => {
        onCategoryChange(cat);
        setActiveTab(null); // Cerrar al seleccionar
    };

    const handleMaxPriceChange = (e) => {
        const newMax = parseInt(e.target.value);
        onPriceChange([0, newMax]);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="mobile-catalog-nav">
            {/* The Floating Pill */}
            <div className="mobile-nav-pill">
                <button 
                    className={`mobile-nav-btn ${activeTab === 'categories' ? 'active' : ''}`} 
                    onClick={() => toggleTab('categories')}
                >
                    <span className="nav-icon">🏷️</span>
                    <span className="nav-text">Categorías</span>
                </button>

                <div className="nav-divider"></div>

                <button 
                    className={`mobile-nav-btn ${activeTab === 'filters' ? 'active' : ''}`} 
                    onClick={() => toggleTab('filters')}
                >
                    <span className="nav-icon">⚖️</span>
                    <span className="nav-text">Filtros</span>
                </button>

                <div className="nav-divider"></div>

                <button 
                    className={`mobile-nav-btn ${activeTab === 'search' ? 'active' : ''}`} 
                    onClick={() => toggleTab('search')}
                >
                    <span className="nav-icon">🔍</span>
                    <span className="nav-text">Buscar</span>
                </button>

                <div className="nav-divider"></div>

                <button 
                    className="mobile-nav-btn cart-btn" 
                    onClick={() => navigate('/cart')}
                >
                    <div className="cart-icon-wrapper">
                        <span className="nav-icon">🛒</span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </div>
                </button>
            </div>

            {/* Dropdown Panels */}
            <div className={`mobile-nav-panel ${activeTab === 'categories' ? 'is-open' : ''}`}>
                <div className="panel-content">
                    <h4 className="panel-title">Seleccionar Categoría</h4>
                    <div className="categories-grid">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`category-pill-btn ${currentCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`mobile-nav-panel ${activeTab === 'filters' ? 'is-open' : ''}`}>
                <div className="panel-content">
                    <h4 className="panel-title">Precio Máximo</h4>
                    <div className="filter-content">
                        <div className="price-display-mobile">
                            Hasta: {formatPrice(priceRange[1])}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="1000"
                            value={priceRange[1]}
                            onChange={handleMaxPriceChange}
                            className="mobile-range-slider"
                        />
                        <button className="apply-filter-btn" onClick={() => setActiveTab(null)}>
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mobile-nav-panel ${activeTab === 'search' ? 'is-open' : ''}`}>
                <div className="panel-content">
                    <h4 className="panel-title">Buscar Producto</h4>
                    <div className="search-content">
                        <input
                            type="text"
                            placeholder="Escribe el nombre..."
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            className="mobile-search-input"
                            autoFocus={activeTab === 'search'}
                        />
                        <button className="apply-filter-btn" onClick={() => setActiveTab(null)}>
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop for closing panels by clicking outside */}
            {activeTab && (
                <div className="mobile-nav-backdrop" onClick={() => setActiveTab(null)}></div>
            )}
        </div>
    );
}
