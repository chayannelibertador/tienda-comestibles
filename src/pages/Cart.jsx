import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import Button from '../components/common/Button';
import BrandIcon from '../components/common/BrandIcon';
import './Cart.css';

export default function Cart() {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalIVA, totalPrice } = useCart();
    const { products } = useProducts();
    const navigate = useNavigate();

    // Cross-Selling Automático: Productos recomendados basados en el contexto actual
    const recommendedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const cartIds = cart.map(item => item.id || item._id);
        const availableProducts = products.filter(p => !cartIds.includes(p.id || p._id) && p.stock > 0);
        
        // Shuffle simple y tomar 3
        const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }, [cart, products]);

    if (cart.length === 0) {
        return (
            <div className="cart-empty page-enter">
                <BrandIcon className="cart-empty-icon" />
                <h2>Tu carrito está vacío</h2>
                <p>¡Explora nuestro catálogo y llena tu despensa!</p>
                <Button variant="primary" onClick={() => navigate('/catalog')}>
                    Ir al Catálogo
                </Button>
            </div>
        );
    }

    return (
        <div className="cart page-enter">
            <h1 className="cart__title">Tu Carrito de Compras</h1>

            <div className="cart__items">
                {cart.map(item => (
                    <div key={item.id || item._id} className="cart__item">
                        <div className="cart__item-image" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.image.startsWith('http') ? (
                                <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px' }} />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>{item.image}</span>
                            )}
                        </div>
                        <div className="cart__item-info">
                            <h3>{item.name}</h3>
                            <p className="cart__item-price">${item.price.toFixed(2)} unitario</p>
                        </div>
                        <div className="cart__item-controls">
                            <Button
                                variant="outline"
                                className="btn-sm"
                                onClick={() => updateQuantity(item.id || item._id, item.quantity - 1)}
                            >
                                -
                            </Button>
                            <span className="cart__item-quantity">{item.quantity}</span>
                            <Button
                                variant="outline"
                                className="btn-sm"
                                onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)}
                            >
                                +
                            </Button>
                        </div>
                        <div className="cart__item-total">
                            ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                            variant="outline"
                            className="btn-danger-outline"
                            onClick={() => removeFromCart(item.id || item._id)}
                        >
                            Eliminar
                        </Button>
                    </div>
                ))}
            </div>

            {/* Barra de progreso: envío gratis a partir de $15.000 */}
            {(() => {
                const FREE_THRESHOLD = 15000;
                const pct = Math.min((totalPrice / FREE_THRESHOLD) * 100, 100);
                const remaining = FREE_THRESHOLD - totalPrice;
                const achieved = totalPrice >= FREE_THRESHOLD;
                return (
                    <div className={`shipping-progress ${achieved ? 'shipping-progress--achieved' : ''}`}>
                        {achieved ? (
                            <p className="shipping-progress__label shipping-progress__label--ok">
                                🎉 ¡Genial! Tu pedido tiene <strong>envío gratis</strong>
                            </p>
                        ) : (
                            <p className="shipping-progress__label">
                                🚚 Sumá <strong>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(remaining)}</strong> más y conseguí <strong>envío gratis</strong>
                            </p>
                        )}
                        <div className="shipping-progress__bar">
                            <div className="shipping-progress__fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })()}

            <div className="cart__summary">
                <div className="cart__total-breakdown">
                    <div className="cart__total-row cart__total-row--final">
                        <span>Total:</span>
                        <span className="cart__total-price-final">${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div className="cart__actions">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas vaciar tu carrito por completo?')) {
                                clearCart();
                            }
                        }}
                    >
                        Vaciar Carrito
                    </Button>
                    <Button 
                        variant="primary" 
                        className="btn-lg" 
                        onClick={() => navigate('/checkout')}
                        disabled={totalPrice < 15000}
                    >
                        Proceder al Pago
                    </Button>
                </div>
            </div>

            {recommendedProducts.length > 0 && (
                <div className="cart__cross-sell" style={{ marginTop: '1.5rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--color-dark)' }}>🛒 Comprados juntos habitualmente</h3>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {recommendedProducts.map(product => (
                            <div key={product.id || product._id} className="cross-sell-item hover-lift" style={{ flex: '0 0 auto', width: '160px', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {product.image.startsWith('http') ? (
                                        <img src={product.image} alt={product.name} style={{ maxHeight: '100%', borderRadius: '4px' }} />
                                    ) : (
                                        <span style={{ fontSize: '2.5rem' }}>{product.image}</span>
                                    )}
                                </div>
                                <h4 style={{ fontSize: '0.9rem', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                                <p style={{ fontWeight: 'bold', color: 'var(--color-primary)', margin: '0' }}>${product.price.toFixed(2)}</p>
                                <Button variant="outline" className="btn-sm" onClick={() => addToCart(product)} style={{ marginTop: 'auto' }}>Agregar</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
