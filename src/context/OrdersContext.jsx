import { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

const OrdersContext = createContext();

export function useOrders() {
    return useContext(OrdersContext);
}

const STORAGE_KEY = 'tienda_orders';

export function OrdersProvider({ children }) {
    const { user } = useUser();
    const [orders, setOrders] = useState(() => {
        // Load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error loading orders from localStorage:', e);
                return [];
            }
        }
        return [];
    });

    // Sync to localStorage whenever orders change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }, [orders]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY) {
                try {
                    const newOrders = JSON.parse(e.newValue);
                    setOrders(newOrders || []);
                } catch (err) {
                    console.error('Error syncing orders from storage event:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const createOrder = (orderData) => {
        // Calculations for Analytics / Dashboard
        const items = orderData.items || [];
        const subtotalBruto = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
        const costoMercaderia = items.reduce((acc, item) => acc + ((parseFloat(item.cost) || parseFloat(item.price)*0.7) * item.quantity), 0); // Si el prod no tiene costo, asume rentabilidad del 30% aprox
        const comisionMP = orderData.paymentMethod === 'Mercado Pago' ? subtotalBruto * 0.05 : 0; 
        const gananciaNetaReal = subtotalBruto - costoMercaderia - comisionMP;

        const newOrder = {
            id: Date.now(),
            userId: user?.email || 'guest',
            customerProfile: {
                name: user?.name,
                email: user?.email,
                age: user?.age,
                phone: user?.phone
            },
            items: items,
            total: orderData.total,
            subtotalBruto,
            costoMercaderia,
            comisionMP,
            impuestosEstimados: 0,
            gananciaNetaReal,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            status: 'pendiente',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + (3 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000).toISOString() // 3-5 días
        };

        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    };

    const getOrders = () => {
        if (!user) return [];
        return orders.filter(order => order.userId === user.email);
    };

    const getOrderById = (id) => {
        return orders.find(order => order.id === parseInt(id));
    };

    const updateOrderStatus = (id, newStatus) => {
        setOrders(prev => prev.map(order =>
            order.id === parseInt(id) ? { ...order, status: newStatus } : order
        ));
    };

    const cancelOrder = (id) => {
        const order = getOrderById(id);
        if (!order) return { success: false, message: 'Pedido no encontrado' };

        // Check 3-hour window
        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);

        if (diffHours > 3) {
            return {
                success: false,
                message: 'El plazo de 3 horas para el arrepentimiento ha expirado. Por favor, contáctanos por otros medios.'
            };
        }

        updateOrderStatus(id, 'cancelado');
        return { success: true, message: 'Pedido cancelado con éxito' };
    };

    const value = {
        orders: getOrders(),
        allOrders: orders, // For admin use
        createOrder,
        getOrderById,
        updateOrderStatus,
        cancelOrder
    };

    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );
}
