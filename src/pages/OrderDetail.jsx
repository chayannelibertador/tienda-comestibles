import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import Button from '../components/common/Button';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders } = useOrders();

    const order = orders?.find(o => o.id === id || String(o.id) === id);
    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

    const getDeliveryEstimation = (dateStr) => {
        const base = dateStr ? new Date(dateStr) : new Date();
        const delivery = new Date(base.getTime() + 72 * 60 * 60 * 1000);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return delivery.toLocaleDateString('es-AR', options).replace(/^\w/, (c) => c.toUpperCase()) + ' de 09:00 a 18:00 hs';
    };

    if (!order) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2>Pedido no encontrado</h2>
                <Button onClick={() => navigate('/orders')} variant="primary">Ver mis pedidos</Button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 2rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Detalle del Pedido #{order.id}</h1>
            
            <div style={{ backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '8px', color: '#0369a1', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚚</span>
                <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>Entrega programada para:</strong> {getDeliveryEstimation(order.createdAt || order.date)}</p>
            </div>

            {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>
                <span>Total pagado</span>
                <span>{formatPrice(order.total)}</span>
            </div>
            <Button onClick={() => navigate(-1)} variant="secondary">Volver</Button>
        </div>
    );
}
