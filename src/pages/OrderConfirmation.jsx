import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import Button from '../components/common/Button';
import BrandIcon from '../components/common/BrandIcon';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
    const { id } = useParams();
    const { getOrderById } = useOrders();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const foundOrder = getOrderById(id);
        if (foundOrder) {
            setOrder(foundOrder);
        }
    }, [id, getOrderById]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="order-confirmation-page">
            <div className="confirmation-card">
                <div className="card-content">
                    <div className="success-icon">
                        <BrandIcon className="confirmation-brand-icon" />
                    </div>
                    <h1>¡Gracias por tu compra!</h1>
                    <p className="order-number">Pedido <strong>#{id.toString().slice(-4)}</strong></p>

                    {order && (
                        <div className="order-brief">
                            <p>Hemos recibido tu pedido correctamente.</p>
                            <div className="brief-total-breakdown">
                                <div className="brief-row">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(order.subtotal || order.total / 1.21)}</span>
                                </div>
                                <div className="brief-row">
                                    <span>IVA:</span>
                                    <span>{formatPrice(order.iva || order.total - (order.total / 1.21))}</span>
                                </div>
                                <div className="brief-row final">
                                    <span>Total:</span>
                                    <strong>{formatPrice(order.total)}</strong>
                                </div>
                            </div>
                            <p>Estado: <span className="status-badge-mini">En preparación</span></p>
                        </div>
                    )}
                </div>

                <div className="delivery-guarantee">
                    <div className="guarantee-icon">🛡️</div>
                    <div className="guarantee-text">
                        <strong>Garantía de Entrega</strong>
                        <p>No te preocupes, estamos procesando tu pedido y llegará en un lapso no mayor a tres días. En caso de retraso, te reintegramos el 5% de tu compra.</p>
                    </div>
                </div>

                <div className="confirmation-actions">
                    <Link to="/my-orders">
                        <Button variant="primary">Ver mis Pedidos</Button>
                    </Link>
                    <Link to="/catalog">
                        <Button variant="outline">Seguir Comprando</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
