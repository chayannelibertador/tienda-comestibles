import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';
import OrderDetail from '../components/admin/OrderDetail';
import './AdminOrders.css';

export default function AdminOrders() {
    const navigate = useNavigate();
    const { allOrders, updateOrderStatus } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
        showToast(`Pedido #${orderId.toString().slice(-4)} actualizado a ${newStatus}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pendiente': return <Badge variant="warning">Pendiente / A Confirmar</Badge>;
            case 'pago_confirmado': return <Badge variant="info">Pago Confirmado</Badge>;
            case 'en_preparacion': return <Badge variant="secondary">Armando Pedido</Badge>;
            case 'en_camino': return <Badge variant="info">En Camino / Delivery</Badge>;
            case 'entregado': return <Badge variant="success">Entregado</Badge>;
            case 'cancelado': return <Badge variant="danger">Cancelado</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Calcular totales para el widget
    const summary = allOrders.reduce((acc, order) => {
        // Solo sumar si no está cancelada
        if (order.status !== 'cancelado') {
            const subtotalBruto = Number(order.subtotalBruto) || 0;
            const comision = (Number(order.comisionMP) || 0) + (Number(order.impuestosEstimados) || 0);
            const costo = Number(order.costoMercaderia) || 0;
            const ganancia = Number(order.gananciaNetaReal) || 0;

            acc.facturado += subtotalBruto;
            acc.costo += costo;
            acc.ganancia += ganancia;
        }
        return acc;
    }, { facturado: 0, costo: 0, ganancia: 0 });

    return (
        <div className="admin-orders">
            <div className="admin-orders__header">
                <div>
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        ← Volver al Dashboard
                    </Button>
                    <h1>Gestión de Pedidos</h1>
                </div>
            </div>

            {/* Widget de Resumen Financiero */}
            <div className="profitability-summary">
                <div className="summary-card">
                    <h3>Facturado (Bruto)</h3>
                    <div className="amount">{formatPrice(summary.facturado)}</div>
                    <small>Dinero total ingresado</small>
                </div>
                <div className="summary-card warning">
                    <h3>A Pagar a Proveedores</h3>
                    <div className="amount">{formatPrice(summary.costo)}</div>
                    <small>Logística 72hs - Reservar HOY</small>
                </div>
                <div className="summary-card success">
                    <h3>Ganancia Disponible</h3>
                    <div className="amount">{formatPrice(summary.ganancia)}</div>
                    <small>Real tras comisiones e impuestos</small>
                </div>
            </div>

            <div className="admin-orders__list">
                {allOrders.length === 0 ? (
                    <div className="empty-orders">
                        <p>No hay pedidos registrados aún.</p>
                    </div>
                ) : (
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Total Bruto</th>
                                    <th>Costo Mercadería</th>
                                    <th>Comis. + Imp.</th>
                                    <th>Ganancia Neta</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.map(order => {
                                    const ganancia = Number(order.gananciaNetaReal) || 0;
                                    const comisionTotal = (Number(order.comisionMP) || 0) + (Number(order.impuestosEstimados) || 0);

                                    return (
                                        <tr key={order.id}>
                                            <td>#{order.id.toString().slice(-4)}</td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>{order.shippingAddress?.name || order.userId}</td>
                                            <td className="total-cell">{formatPrice(order.subtotalBruto || order.total)}</td>
                                            <td className="cost-cell">{formatPrice(order.costoMercaderia || 0)}</td>
                                            <td className="expense-cell">-{formatPrice(comisionTotal)}</td>
                                            <td className={`profit-cell ${ganancia <= 0 ? 'negative' : 'positive'}`}>
                                                {formatPrice(ganancia)}
                                                {ganancia <= 0 && <span className="alert-icon" title="Ganancia negativa o cero">⚠️</span>}
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td className="actions-cell">
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                        🔍 Ver Detalle
                                                    </Button>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="status-select"
                                                    >
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="pago_confirmado">Pago Confirmado</option>
                                                        <option value="en_preparacion">En Preparación</option>
                                                        <option value="en_camino">En Camino</option>
                                                        <option value="entregado">Entregado</option>
                                                        <option value="cancelado">Cancelado</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <OrderDetail
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
