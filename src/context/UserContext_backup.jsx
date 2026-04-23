import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

// Helper para que ProductsContext pueda leer el token sin el hook
export function getAdminToken() {
    return localStorage.getItem('admin_token');
}

const SESSION_KEY = 'tienda_session';
const USERS_REGISTRY_KEY = 'tienda_users_registry';

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
        if (user && user.role !== 'admin') {
            const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');
            const userData = registry[user.email] || {};
            setAddresses(userData.addresses || []);
            setDefaultAddressId(userData.defaultAddressId || null);
        } else {
            setAddresses(null); // Reset to null on logout
            setDefaultAddressId(null);
        }
    }, [user]);

    // Save user data to registry when addresses change
    useEffect(() => {
        if (user && user.role !== 'admin' && addresses !== null) {
            const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');
            registry[user.email] = {
                ...user,
                addresses,
                defaultAddressId
            };
            localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
        }
    }, [user, addresses, defaultAddressId]);

    const checkUserExists = (email) => {
        const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');
        return !!registry[email];
    };

    const validateCredentials = (email, password) => {
        const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');
        const user = registry[email];
        if (user && user.password === password) {
            return user;
        }
        return null;
    };

    const login = (userData, initialAddress = null) => {
        // userData: { name, email, age, phone, password (optional if login) }
        const newUser = { ...userData, role: 'user' };

        // Ensure user is in registry
        const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');

        // If it's a new registration (not in registry) OR we are updating data
        if (!registry[userData.email]) {
            const newAddresses = initialAddress ? [{ ...initialAddress, id: Date.now() }] : [];
            registry[userData.email] = {
                ...newUser,
                addresses: newAddresses,
                defaultAddressId: newAddresses.length > 0 ? newAddresses[0].id : null
            };
            localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
        }

        setUser(newUser);
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

    const getUserCart = (email) => {
        if (!email) return [];
        const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');
        const userRecord = registry[email];
        return userRecord && userRecord.cart ? userRecord.cart : [];
    };

    const updateUserCart = (email, cartItems) => {
        if (!email) return;
        const registry = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '{}');

        if (registry[email]) {
            registry[email] = {
                ...registry[email],
                cart: cartItems
            };
            localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            checkUserExists,
            validateCredentials,
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
