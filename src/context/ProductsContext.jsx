import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useUser, getAdminToken } from './UserContext';

const ProductsContext = createContext();

export function useProducts() {
    return useContext(ProductsContext);
}

// API URL
const API_URL = '/api/products'; // Usará el proxy de Vite en desarrollo

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useUser(); // Para tokens si fuera necesario (aunque GET es público)
    const { addToast } = useToast();

    const fetchProducts = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const { page = 1, limit = 0, category = 'Todos', search = '', append = false, admin = false } = params;
            const queryParams = new URLSearchParams();
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);
            if (category) queryParams.append('category', category);
            if (search) queryParams.append('search', search);

            const endpoint = admin ? '/api/admin/products' : API_URL;
            const headers = admin ? { 'Authorization': `Bearer ${getAdminToken()}` } : {};

            const response = await fetch(`${endpoint}?${queryParams.toString()}`, { headers });
            if (!response.ok) throw new Error('Error al cargar productos');
            
            const data = await response.json();
            
            if (data.data) {
                setProducts(prev => append ? [...prev, ...data.data] : data.data);
                setTotalPages(data.totalPages);
                setCurrentPage(data.page);
            } else {
                setProducts(data);
                setTotalPages(1);
                setCurrentPage(1);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar productos al montar
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`,
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear producto');
            }

            const newProduct = await response.json();
            setProducts(prev => [...prev, newProduct]);
            addToast('Producto creado exitosamente surtidito', 'success');
            return newProduct;
        } catch (err) {
            console.error('Error adding product:', err);
            addToast(err.message, 'error');
            throw err;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`,
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar producto');
            }

            const updatedProduct = await response.json();
            setProducts(prev => prev.map(p =>
                p._id === id || p.id === id ? updatedProduct : p
            ));
            addToast('Producto actualizado correctamente', 'success');
            return updatedProduct;
        } catch (err) {
            console.error('Error updating product:', err);
            addToast(err.message, 'error');
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar producto');
            }

            setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
            addToast('Producto eliminado', 'info');
        } catch (err) {
            console.error('Error deleting product:', err);
            addToast(err.message, 'error');
            throw err;
        }
    };

    const getProductById = (id) => {
        return products.find(p => p._id === id || p.id === parseInt(id));
    };

    const value = {
        products,
        loading,
        error,
        totalPages,
        currentPage,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
    };

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    );
}
