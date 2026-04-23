import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import Button from '../components/common/Button';

export default function Orders() {
    const navigate = useNavigate();
    const { orders } = useOrders();

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Mis Pedidos</h1>
            {(!orders || orders.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>No tenés pedidos aún.</p>
                    <Button onClick={() => navigate('/catalog')} variant="primary">
                        Ir al catálogo
                    </Button>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)}
                        style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600 }}>Pedido #{order.id}</span>
                            <span style={{ color: '#e63946', fontWeight: 700 }}>{formatPrice(order.total)}</span>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            {order.items?.length} artículos
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
