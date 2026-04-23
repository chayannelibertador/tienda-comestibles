import { useOrders } from '../../context/OrdersContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import './CustomerOrderDetail.css';

export default function CustomerOrderDetail({ order, onClose }) {
    const { cancelOrder } = useOrders();
    if (!order) return null;

    const handleCancel = () => {
        if (window.confirm('¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
            const result = cancelOrder(order.id);
            if (result.success) {
                onClose();
            } else {
                alert(result.message);
            }
        }
    };

    const isCancellable = () => {
        if (order.status !== 'pendiente') return false;
        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours <= 3;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pendiente':
                return {
                    badge: <Badge variant="warning">En preparación</Badge>,
                    message: 'Estamos preparando tu pedido con el mayor cuidado.',
                    icon: '📦'
                };
            case 'enviado':
                return {
                    badge: <Badge variant="info">En camino</Badge>,
                    message: 'Tu pedido está en camino. Llegará pronto a tu dirección.',
                    icon: '🚚'
                };
            case 'entregado':
                return {
                    badge: <Badge variant="success">Entregado</Badge>,
                    message: '¡Disfruta de tu compra! Esperamos verte pronto.',
                    icon: '✅'
                };
            case 'cancelado':
                return {
                    badge: <Badge variant="danger">Cancelado</Badge>,
                    message: 'Este pedido fue cancelado. Contáctanos si necesitas ayuda.',
                    icon: '❌'
                };
            default:
                return {
                    badge: <Badge variant="secondary">{status}</Badge>,
                    message: 'Estamos procesando tu pedido.',
                    icon: '⏳'
                };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="customer-order-overlay" onClick={onClose}>
            <div className="customer-order-modal" onClick={e => e.stopPropagation()}>
                <div className="customer-order-header">
                    <div className="header-content">
                        <h2>Pedido #{order.id.toString().slice(-4)}</h2>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <Button variant="outline" onClick={onClose} className="close-btn">&times;</Button>
                </div>

                <div className="customer-order-content">
                    {/* Status Card */}
                    <div className="status-card">
                        <div className="status-icon">{statusInfo.icon}</div>
                        <div className="status-info">
                            {statusInfo.badge}
                            <p className="status-message">{statusInfo.message}</p>
                        </div>
                    </div>

                    {/* Delivery Guarantee Banner */}
                    {(order.status === 'pendiente' || order.status === 'enviado') && (
                        <div className="guarantee-banner">
                            <span className="guarantee-icon">🛡️</span>
                            <div className="guarantee-content">
                                <strong>Garantía de Entrega</strong>
                                <p>Entrega garantizada en 3 días o te reintegramos el 5% de tu compra.</p>
                            </div>
                        </div>
                    )}

                    {/* Products Section */}
                    <section className="customer-section">
                        <h3>🛒 Resumen de tu Pedido</h3>
                        <div className="products-list">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <div key={index} className="product-row">
                                        <div className="product-info">
                                            <span className="product-name">{item.name}</span>
                                            <span className="product-qty">x{item.quantity}</span>
                                        </div>
                                        <span className="product-price">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-items">No hay productos en este pedido</p>
                            )}
                            <div className="order-total-breakdown">
                                <div className="total-row-minor">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal || order.total / 1.21)}</span>
                                </div>
                                <div className="total-row-minor border-bottom">
                                    <span>IVA</span>
                                    <span>{formatPrice(order.iva || order.total - (order.total / 1.21))}</span>
                                </div>
                                <div className="total-row-major">
                                    <span>Total</span>
                                    <span className="total-amount">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Address */}
                    <section className="customer-section">
                        <h3>📍 Dirección de Entrega</h3>
                        {order.shippingAddress ? (
                            <div className="shipping-box">
                                <p className="recipient-name">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.street} {order.shippingAddress.number} {order.shippingAddress.floor && `(Piso: ${order.shippingAddress.floor})`}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                <p>C.P.: {order.shippingAddress.postalCode}</p>
                                <p>Tel: {order.shippingAddress.phone}</p>
                                {order.shippingAddress.notes && (
                                    <p className="shipping-notes"><em>Notas: {order.shippingAddress.notes}</em></p>
                                )}
                            </div>
                        ) : (
                            <p className="no-address">No hay información de envío disponible.</p>
                        )}
                    </section>

                    {/* Payment Method */}
                    <section className="customer-section">
                        <h3>💳 Método de Pago</h3>
                        <p className="payment-method">{order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : 'No especificado'}</p>
                    </section>

                    {/* Help Section */}
                    <div className="help-section">
                        <p className="help-text">
                            ¿Necesitas ayuda? <a href="/contact">Contáctanos</a> y te asistiremos de inmediato.
                        </p>
                    </div>
                </div>

                <div className="customer-order-footer">
                    {isCancellable() && (
                        <Button
                            variant="outline"
                            className="btn-cancel-detail"
                            onClick={handleCancel}
                        >
                            ↩️ Botón de Arrepentimiento
                        </Button>
                    )}
                    <Button variant="primary" onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}
