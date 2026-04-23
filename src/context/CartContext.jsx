import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useUser } from './UserContext';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const { user, isAdmin, getUserCart, updateUserCart } = useUser();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Helper para obtener la clave de almacenamiento según el usuario
    const getStorageKey = useCallback(() => {
        if (user && user.email) {
            return `tienda_cart_${user.email}`;
        }
        return 'tienda_cart_guest';
    }, [user]);

    // Limpieza de sesión (para llamar desde UserContext o Navbar al salir)
    const clearSession = useCallback(() => {
        const key = getStorageKey();
        localStorage.removeItem(key);
        setCart([]); // Limpiar estado visual
    }, [getStorageKey]);

    // Inicializar estado
    const [cart, setCart] = useState(() => {
        const key = user && user.email ? `tienda_cart_${user.email}` : 'tienda_cart_guest';
        const stored = localStorage.getItem(key);
        try {
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validación de Propiedad: Si el formato es nuevo { owner, items }
                if (parsed.owner) {
                    // Verificar si coincide con el usuario actual
                    const currentOwner = user ? user.email : 'guest';
                    if (parsed.owner === currentOwner) {
                        return parsed.items || [];
                    }
                } else if (Array.isArray(parsed)) {
                    // Soporte para formato antiguo
                    return parsed;
                }
            }
            return [];
        } catch (error) {
            console.error('Error parsing cart:', error);
            return [];
        }
    });

    // Sincronización Doble Vía: Cargar y validar cuando cambia el usuario
    useEffect(() => {
        if (user && user.email) {
            localStorage.removeItem('tienda_cart_guest');
            // Asegurar que el carrito siempre sea un arreglo, incluso si viene null de la BD
            const userCart = user.cart;
            setCart(Array.isArray(userCart) ? userCart : []);
        } else {
            // Usuario anónimo (Guest)
            const stored = localStorage.getItem('tienda_cart_guest');
            try {
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCart(parsed.items || []);
                } else {
                    setCart([]);
                }
            } catch (error) {
                setCart([]);
            }
        }
    }, [user]);

    // Persistir con metadatos de propiedad y sincronizar nube
    useEffect(() => {
        if (!user) {
            const dataToStore = {
                owner: 'guest',
                items: cart,
                updatedAt: Date.now()
            };
            localStorage.setItem('tienda_cart_guest', JSON.stringify(dataToStore));
        } else if (user && user.email) {
            // Sincronizar hacia el backend real SOLO cuando el carrito cambia
            updateUserCart(user.email, cart);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        if (isAdmin()) {
            addToast('⛔ Los administradores no pueden realizar compras.', 'error');
            return;
        }

        // Bloquear usuarios no autenticados
        if (!user) {
            addToast('🔒 Iniciá sesión para agregar productos al carrito.', 'info');
            navigate('/login');
            return;
        }

        // Verificar stock disponible
        const availableStock = product.stock ?? Infinity;
        if (availableStock === 0) {
            addToast(`${product.name} no tiene stock disponible.`, 'error');
            return;
        }

        const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
        const existingItem = cart.find(item => item.id === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + qty > availableStock) {
            addToast(`Solo hay ${availableStock} unidad${availableStock !== 1 ? 'es' : ''} disponible${availableStock !== 1 ? 's' : ''} de ${product.name}.`, 'error');
            return;
        }

        if (existingItem) {
            addToast(`Se actualizó la cantidad de ${product.name}`, 'info');
            setCart(prevCart => prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
            ));
        } else {
            addToast(`${product.name} agregado al carrito`);
            setCart(prevCart => [...prevCart, { ...product, quantity: qty }]);
        }
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prevCart => prevCart.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalIVA = cart.reduce((sum, item) => {
        const rate = item.ivaRate || 0;
        const itemTotal = item.price * item.quantity;
        return sum + (itemTotal * (rate / (100 + rate)));
    }, 0);
    const subtotal = totalPrice - totalIVA;

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            const currentKey = getStorageKey();
            if (e.key === currentKey) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : null;
                    if (newValue && newValue.items) {
                        setCart(newValue.items);
                    } else if (Array.isArray(newValue)) {
                        setCart(newValue);
                    } else {
                        setCart([]);
                    }
                } catch (err) {
                    console.error('Error syncing cart:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [getStorageKey]);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            clearSession,
            totalItems,
            subtotal,
            totalIVA,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}
