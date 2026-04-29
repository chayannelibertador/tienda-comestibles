import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ProductSkeletonCard } from '../components/common/Skeleton';
import Sidebar from '../components/layout/Sidebar';
import MobileCatalogNav from '../components/layout/MobileCatalogNav';
import './Catalog.css';

export default function Catalog() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { products, fetchProducts, currentPage, totalPages, loading } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]);

    const categoryFilter = searchParams.get('category') || 'Todos';

    // Disparar búsqueda al cambiar de categoría o término
    useEffect(() => {
        fetchProducts({ 
            page: 1, 
            limit: 12, 
            category: categoryFilter, 
            search: searchTerm 
        });
    }, [categoryFilter, searchTerm, fetchProducts]);

    const handleLoadMore = () => {
        if (currentPage < totalPages && !loading) {
            fetchProducts({ 
                page: currentPage + 1, 
                limit: 12, 
                category: categoryFilter, 
                search: searchTerm, 
                append: true 
            });
        }
    };

    // El precio sigue siendo filtrado localmente sobre los resultados actuales de la paginación
    const filteredProducts = products.filter(product => {
        return product.price >= priceRange[0] && product.price <= priceRange[1];
    });

    // Tracking de búsquedas fallidas
    const searchLoggedInfo = useRef(new Set());
    useEffect(() => {
        if (!loading && filteredProducts.length === 0 && searchTerm.trim().length > 2) {
            const termLower = searchTerm.trim().toLowerCase();
            if (!searchLoggedInfo.current.has(termLower)) {
                searchLoggedInfo.current.add(termLower);
                fetch('/api/failed-searches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ term: termLower })
                }).catch(() => {}); // Fallback silencioso
            }
        }
    }, [loading, filteredProducts.length, searchTerm]);

    return (
        <div className="catalog-container page-enter">
            <Sidebar onSearch={setSearchTerm} onPriceChange={setPriceRange} />
            <MobileCatalogNav 
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                currentCategory={categoryFilter}
                onCategoryChange={(cat) => {
                    if (cat === 'Todos') {
                        searchParams.delete('category');
                        setSearchParams(searchParams);
                    } else {
                        setSearchParams({ category: cat });
                    }
                }}
            />

            <div className="catalog-content">
                <div className="catalog-promo-banner hover-lift">
                    <img src="/promo_banner.png" alt="Promociones Especiales" className="promo-banner-image" />
                    <div className="promo-banner-overlay">
                        <h3>Ofertas Especiales</h3>
                        <p>Descubre nuestros productos premium seleccionados para ti.</p>
                    </div>
                </div>

                <h2 className="catalog__title">
                    {categoryFilter === 'Todos' ? 'Catálogo Completo' : categoryFilter}
                    {searchTerm && <span className="text-sm text-gray-500 ml-2">Resultados para "{searchTerm}"</span>}
                </h2>

                {loading && filteredProducts.length === 0 ? (
                    <div className="catalog__grid">
                        {[...Array(8)].map((_, i) => <ProductSkeletonCard key={`skel-${i}`} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="no-results-premium">
                        <div className="no-results-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-dark)' }}>¡Oops! No lo tenemos.</h3>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>No hay productos que coincidan con tu búsqueda.</p>
                        <Button variant="outline" onClick={() => navigate('/catalog')}>Explorar Productos Frescos</Button>
                    </div>
                ) : (
                    <>
                        <div className="catalog__grid">
                            {filteredProducts.map((product, index) => (
                                <Card
                                    key={product._id || product.id}
                                    className={`product-card hover-lift${product.stock === 0 ? ' out-of-stock' : ''}`}
                                    product={product}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {product.badge && (
                                        <div className="product-badge-promo">{product.badge}</div>
                                    )}
                                    {product.category === 'Express' && (
                                        <div className="express-badge">Express</div>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="stock-badge out">Sin stock</div>
                                    )}
                                    {product.stock > 0 && product.stock <= 5 && (
                                        <div className="stock-badge low">⚠️ Últimas {product.stock} unidades</div>
                                    )}
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
                                        <span className="product-price">{product.price.toFixed(2)}</span>
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                        >
                                            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        
                        {currentPage < totalPages && (
                            <div className="load-more-container" style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <Button 
                                    variant="outline" 
                                    onClick={handleLoadMore} 
                                    disabled={loading}
                                >
                                    {loading ? 'Cargando...' : 'Cargar más productos'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
