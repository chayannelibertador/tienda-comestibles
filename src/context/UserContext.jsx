import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

// Helper para que ProductsContext pueda leer el token sin el hook
export function getAdminToken() {
    return localStorage.getItem('admin_token') || localStorage.getItem('user_token');
}

const SESSION_KEY = 'tienda_session';

export function UserProvider({ children }) {
    // Load session and users registry from localStorage
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem(SESSION_KEY);
        try {
            const parsed = stored ? JSON.parse(stored) : null;
            return (parsed && (parsed.email || parsed.name)) ? parsed : null;
        } catch (e) {
            return null;
        }
    });

    const [addresses, setAddresses] = useState(null);
    const [defaultAddressId, setDefaultAddressId] = useState(null);

    // Persist session
    useEffect(() => {
        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }, [user]);

    // Load/Save user data from registry when user changes
    useEffect(() => {
        if (!user) {
            setAddresses(null);
            setDefaultAddressId(null);
        }
    }, [user]);

    // Save user data to registry when addresses change
    useEffect(() => {
        if (user && user.role !== 'admin' && addresses !== null) {
            const token = localStorage.getItem('user_token');
            if (token) {
                fetch('/api/users/addresses', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ addresses, defaultAddressId })
                }).catch(e => console.error(e));
            }
        }
    }, [user, addresses, defaultAddressId]);

    const registerUser = async (userData, initialAddress = null) => {
        const addrs = initialAddress ? [{ ...initialAddress, id: Date.now() }] : [];
        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, addresses: addrs })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            
            localStorage.setItem('user_token', data.token);
            setUser({ ...data.user, role: 'user' });
            setAddresses(data.user.addresses || []);
            setDefaultAddressId(data.user.default_address_id);
            return { success: true, cart: data.user.cart };
        } catch (e) {
            return { success: false, error: 'Error de red.' };
        }
    };

    const loginUser = async (email, password) => {
        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            
            localStorage.setItem('user_token', data.token);
            setUser({ ...data.user, role: 'user' });
            setAddresses(data.user.addresses || []);
            setDefaultAddressId(data.user.default_address_id);
            return { success: true, cart: data.user.cart };
        } catch (e) {
            return { success: false, error: 'Error de red.' };
        }
    };

    const loginWithGoogle = async (credential) => {
        try {
            const res = await fetch('/api/users/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            
            localStorage.setItem('user_token', data.token);
            setUser({ ...data.user, role: 'user' });
            setAddresses(data.user.addresses || []);
            setDefaultAddressId(data.user.default_address_id);
            return { success: true, cart: data.user.cart };
        } catch (e) {
            return { success: false, error: 'Error de red con Google.' };
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) return false;
            const { token } = await response.json();
            localStorage.setItem('admin_token', token);
            setUser({ name: 'Administrador', email, role: 'admin' });
            return true;
        } catch {
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setAddresses(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_token');
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    // Address management functions
    const addAddress = (addressData) => {
        const newAddress = {
            id: Date.now(),
            ...addressData
        };

        setAddresses(prev => {
            const current = prev || [];
            // If it's the first address, make it default immediately in state logic
            if (current.length === 0) {
                setDefaultAddressId(newAddress.id);
            }
            return [...current, newAddress];
        });

        // Also ensure default is set if we currently have no default
        if (!defaultAddressId) {
            setDefaultAddressId(newAddress.id);
        }

        return newAddress;
    };

    const updateAddress = (id, addressData) => {
        setAddresses(prev => {
            if (!prev) return [];
            return prev.map(addr =>
                addr.id === id ? { ...addr, ...addressData, id } : addr
            );
        });
    };

    const deleteAddress = (id) => {
        setAddresses(prev => {
            if (!prev) return [];
            return prev.filter(addr => addr.id !== id);
        });

        // If deleting default address, clear it
        if (defaultAddressId === id) {
            setDefaultAddressId(null);
        }
    };

    const setDefaultAddress = (id) => {
        setDefaultAddressId(id);
    };

    const getDefaultAddress = () => {
        if (!addresses) return null;
        return addresses.find(addr => addr.id === defaultAddressId);
    };

    // Dummy for cart context compatibility, the cart context itself fetches items now
    const getUserCart = () => []; 
    const updateUserCart = async (email, cartItems) => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        try {
            await fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ items: cartItems })
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            loginUser,
            loginWithGoogle,
            registerUser,
            loginAdmin,
            logout,
            isAdmin,
            addresses: addresses || [],
            defaultAddressId,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            getDefaultAddress,
            getUserCart,     /* Nuevo: recuperar carrito persistente */
            updateUserCart   /* Nuevo: guardar carrito persistente */
        }}>
            {children}
        </UserContext.Provider>
    );
}
