import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrdersContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import AddressForm from '../components/checkout/AddressForm';
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout, addresses, deleteAddress, setDefaultAddress, addAddress } = useUser();
    const { orders } = useOrders();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [showAddressForm, setShowAddressForm] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    const lastOrder = orders && orders.length > 0 ? orders[0] : null;

    const handleAddressSubmit = (addressData) => {
        addAddress(addressData);
        setShowAddressForm(false);
    };

    const handleRepeatOrder = () => {
        if (!lastOrder || !lastOrder.items) return;
        lastOrder.items.forEach(item => addToCart(item));
        addToast('¡Pedido agregado al carrito!', 'success');
        navigate('/cart');
    };

    const formatPrice = (price) => {
        try {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price || 0);
        } catch { return '$0'; }
    };

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U';
    };

    return (
        <div className="profile-page page-enter">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {getInitials(user.name)}
                    </div>
                    <div className="profile-info">
                        <h1>{user.name}</h1>
                        <span className="profile-email">{user.email}</span>
                        <div className="profile-badges">
                            <span className="badge-pro">Cliente</span>
                        </div>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="profile-grid">
                        <section className="profile-card personal-data">
                            <div className="card-header">
                                <h3>👤 Información Personal</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="label">Nombre</span>
                                    <span className="value">{user.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Email</span>
                                    <span className="value">{user.email}</span>
                                </div>
                                {user.age ? (
                                    <div className="info-row">
                                        <span className="label">Edad</span>
                                        <span className="value">{user.age} años</span>
                                    </div>
                                ) : (
                                    <p className="text-muted">Edad no especificada</p>
                                )}
                                {user.phone ? (
                                    <div className="info-row">
                                        <span className="label">Teléfono</span>
                                        <span className="value">{user.phone}</span>
                                    </div>
                                ) : (
                                    <p className="text-muted">Teléfono no especificado</p>
                                )}
                            </div>
                        </section>

                        <section className="profile-card addresses-section">
                            <div className="card-header flex-between">
                                <h3>📍 Mis Direcciones</h3>
                                {!showAddressForm && (
                                    <Button variant="outline" className="btn-sm" onClick={() => setShowAddressForm(true)}>
                                        + Nueva
                                    </Button>
                                )}
                            </div>

                            <div className="card-body">
                                {showAddressForm ? (
                                    <div className="address-form-wrapper">
                                        <AddressForm
                                            onSubmit={handleAddressSubmit}
                                            onCancel={() => setShowAddressForm(false)}
                                            showName={false}
                                            initialData={{ name: user.name, phone: user.phone }}
                                        />
                                    </div>
                                ) : (
                                    <div className="addresses-list">
                                        {addresses.length === 0 ? (
                                            <div className="empty-state">
                                                <p>No tienes direcciones guardadas.</p>
                                            </div>
                                        ) : (
                                            addresses.map(addr => (
                                                <div key={addr.id} className="address-item hover-lift">
                                                    <div className="address-icon">🏠</div>
                                                    <div className="address-details">
                                                        <strong>{addr.street} {addr.number}</strong>
                                                        <span className="text-muted">{addr.city}, {addr.province}</span>
                                                        <span className="text-xs">CP: {addr.postalCode}</span>
                                                    </div>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => deleteAddress(addr.id)}
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="profile-card orders-section">
                            <div className="card-header">
                                <h3>📦 Mis Pedidos</h3>
                            </div>
                            <div className="card-body">
                                <p className="mb-4 text-muted">Consulta el estado de tus compras recientes.</p>
                                <Button variant="secondary" fullWidth onClick={() => navigate('/my-orders')}>
                                    Ver Historial de Pedidos
                                </Button>
                            </div>
                        </section>

                        {/* Mis Habituales */}
                        <section className="profile-card habituales-section">
                            <div className="card-header">
                                <h3>🔁 Mis Habituales</h3>
                                {lastOrder && (
                                    <span className="habituales-date">
                                        {new Date(lastOrder.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                    </span>
                                )}
                            </div>
                            <div className="card-body">
                                {!lastOrder ? (
                                    <div className="empty-state">
                                        <p>Aún no realizaste ningún pedido.</p>
                                        <Button variant="outline" onClick={() => navigate('/catalog')} style={{ marginTop: '0.75rem' }}>
                                            Ir al Catálogo
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="habituales-subtitle">Productos de tu último pedido</p>
                                        <div className="habituales-list">
                                            {lastOrder.items.map((item, idx) => (
                                                <div key={item.id || idx} className="habitual-item">
                                                    <div className="habitual-item__image">
                                                        {item.image && item.image.startsWith('http') ? (
                                                            <img src={item.image} alt={item.name} />
                                                        ) : (
                                                            <span>{item.image}</span>
                                                        )}
                                                    </div>
                                                    <p className="habitual-item__name">{item.name}</p>
                                                    <p className="habitual-item__price">{formatPrice(item.price)}</p>
                                                    <span className="habitual-item__qty">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="primary" fullWidth onClick={handleRepeatOrder} style={{ marginTop: '1.25rem' }}>
                                            🛒 Repetir pedido completo
                                        </Button>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
