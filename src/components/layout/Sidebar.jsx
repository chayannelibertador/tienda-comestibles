import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import './Sidebar.css';

const CATEGORIES = ['Todos', 'Express', 'Frutas', 'Verduras', 'Panadería', 'Lácteos', 'Bebidas'];

export default function Sidebar({ onSearch, onPriceChange }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('category') || 'Todos';
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Notify parent of price changes
    useEffect(() => {
        if (onPriceChange) {
            onPriceChange(priceRange);
        }
    }, [priceRange, onPriceChange]);

    const handleCategoryClick = (category) => {
        if (category === 'Todos') {
            searchParams.delete('category');
            setSearchParams(searchParams);
        } else {
            setSearchParams({ category });
        }
    };

    const handleMinPriceChange = (e) => {
        const newMin = parseInt(e.target.value);
        setPriceRange([newMin, priceRange[1]]);
    };

    const handleMaxPriceChange = (e) => {
        const newMax = parseInt(e.target.value);
        setPriceRange([priceRange[0], newMax]);
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
        <aside className="sidebar">
            <div className="sidebar__section">
                <h3 className="sidebar__title">Buscar</h3>
                <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sidebar__search"
                />
            </div>

            <div className="sidebar__section">
                <h3 className="sidebar__title">Categorías</h3>
                <ul className="sidebar__categories">
                    {CATEGORIES.map(cat => (
                        <li key={cat}>
                            <button
                                className={`sidebar__cat-btn ${currentCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(cat)}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="sidebar__section">
                <h3 className="sidebar__title">Precios</h3>
                <div className="sidebar__price-range">
                    <div className="price-inputs">
                        <div className="price-input-group">
                            <label>Mínimo</label>
                            <input
                                type="number"
                                min="0"
                                max="100000"
                                step="1000"
                                value={priceRange[0]}
                                onChange={handleMinPriceChange}
                                className="price-input"
                            />
                        </div>
                        <div className="price-input-group">
                            <label>Máximo</label>
                            <input
                                type="number"
                                min="0"
                                max="100000"
                                step="1000"
                                value={priceRange[1]}
                                onChange={handleMaxPriceChange}
                                className="price-input"
                            />
                        </div>
                    </div>
                    <div className="price-range-slider">
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="1000"
                            value={priceRange[0]}
                            onChange={handleMinPriceChange}
                            className="range-slider"
                        />
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="1000"
                            value={priceRange[1]}
                            onChange={handleMaxPriceChange}
                            className="range-slider"
                        />
                    </div>
                    <div className="price-display">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>—</span>
                        <span>{formatPrice(priceRange[1])}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
