import Button from '../common/Button';
import Badge from '../common/Badge';
import './OrderDetail.css';

export default function OrderDetail({ order, onClose }) {
    if (!order) return null;

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
        <div className="order-detail-overlay" onClick={onClose}>
            <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="order-detail-header">
                    <h2>Detalle del Pedido #{order.id.toString().slice(-4)}</h2>
                    <Button variant="outline" onClick={onClose} className="close-btn">&times;</Button>
                </div>

                <div className="order-detail-content">
                    <section className="detail-section">
                        <h3>📋 Información General</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Fecha:</label>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Estado:</label>
                                <span>{getStatusBadge(order.status)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Método de Pago:</label>
                                <span className="capitalize">{order.paymentMethod || 'No especificado'}</span>
                            </div>
                        </div>
                    </section>

                    {order.customerProfile && (
                        <section className="detail-section">
                            <h3>👤 Ficha de Cliente</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Nombre:</label>
                                    <span>{order.customerProfile.name}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Email:</label>
                                    <span>{order.customerProfile.email}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Edad:</label>
                                    <span>{order.customerProfile.age} años</span>
                                </div>
                                <div className="detail-item">
                                    <label>Teléfono:</label>
                                    <span>{order.customerProfile.phone}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="detail-section">
                        <h3>📍 Dirección de Envío</h3>
                        {order.shippingAddress ? (
                            <div className="address-info">
                                <p><strong>{order.shippingAddress.name}</strong></p>
                                <p>{order.shippingAddress.street} {order.shippingAddress.number} {order.shippingAddress.floor && `(Piso: ${order.shippingAddress.floor})`}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                <p>C.P.: {order.shippingAddress.postalCode}</p>
                                <p>Tel: {order.shippingAddress.phone}</p>
                                {order.shippingAddress.notes && (
                                    <p className="address-notes"><em>Notas: {order.shippingAddress.notes}</em></p>
                                )}
                            </div>
                        ) : (
                            <p>No hay información de envío disponible.</p>
                        )}
                    </section>

                    <section className="detail-section">
                        <h3>🛒 Productos</h3>
                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cant.</th>
                                        <th>Precio</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatPrice(item.price)}</td>
                                                <td className="subtotal-cell">{formatPrice(item.price * item.quantity)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">No hay ítems en este pedido</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                                        <td className="total-cell">{formatPrice(order.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="order-detail-footer">
                    <Button variant="primary" onClick={() => window.print()} className="print-btn">
                        🖨️ Imprimir Comprobante
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}
