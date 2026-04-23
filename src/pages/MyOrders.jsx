import { useState } from 'react';
import { useOrders } from '../context/OrdersContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CustomerOrderDetail from '../components/customer/CustomerOrderDetail';
import './MyOrders.css';

export default function MyOrders() {
    const { orders, cancelOrder } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleCancel = (e, orderId) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
            const result = cancelOrder(orderId);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    const isCancellable = (order) => {
        if (order.status !== 'pendiente') return false;
        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours <= 3;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pendiente': return <Badge variant="warning">Pendiente</Badge>;
            case 'enviado': return <Badge variant="info">Enviado</Badge>;
            case 'entregado': return <Badge variant="success">Entregado</Badge>;
            case 'cancelado': return <Badge variant="danger">Cancelado</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="my-orders page-enter">
            <h1>Mis Pedidos</h1>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <p>Todavía no realizaste ninguna compra.</p>
                    <Button variant="primary" onClick={() => window.location.href = '/catalog'}>
                        Ir a la Tienda
                    </Button>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map(order => (
                        <div key={order.id} className="user-order-card">
                            <div className="card-header">
                                <span className="order-id">Pedido #{order.id.toString().slice(-4)}</span>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="card-body">
                                <p>Fecha: <strong>{formatDate(order.createdAt)}</strong></p>
                                <p>Total: <strong className="price">{formatPrice(order.total)}</strong></p>
                                <p>Ítems: {order.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
                            </div>
                            <div className="card-footer">
                                <Button variant="outline" fullWidth onClick={() => setSelectedOrder(order)}>
                                    🔍 Ver Detalle
                                </Button>
                                {isCancellable(order) && (
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        className="btn-cancel"
                                        onClick={(e) => handleCancel(e, order.id)}
                                    >
                                        ↩️ Botón de Arrepentimiento
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <CustomerOrderDetail
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
