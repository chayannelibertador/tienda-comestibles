import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import ProductList from '../components/admin/ProductList';
import ProductForm from '../components/admin/ProductForm';
import Button from '../components/common/Button';
import './AdminProducts.css';

export default function AdminProducts() {
    const navigate = useNavigate();
    const { products, addProduct, updateProduct, deleteProduct, loading, fetchProducts, currentPage, totalPages } = useProducts();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [page, setPage] = useState(1);

    // Reset pagination on filter change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, categoryFilter]);

    // Fetch server data
    useEffect(() => {
        fetchProducts({ page, limit: 10, category: categoryFilter, search: searchTerm, admin: true });
    }, [page, categoryFilter, searchTerm, fetchProducts]);

    const handleAddClick = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleFormSubmit = async (productData) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await addProduct(productData);
            }
            setShowForm(false);
            setEditingProduct(null);
        } catch (error) {
            // El error ya es manejado y mostrado como toast en ProductsContext
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await deleteProduct(id);
        } catch (error) {
            // Error manejado en context
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleQuickStockUpdate = async (product, qtyToAdd) => {
        try {
            await updateProduct(product._id || product.id, { 
                ...product, 
                stock: product.stock + qtyToAdd 
            });
        } catch (error) {
            // Error manejado en context
        }
    };

    return (
        <div className="admin-products">
            <div className="admin-products__header">
                <div>
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        ← Volver al Dashboard
                    </Button>
                    <h1>Gestión de Productos</h1>
                </div>
                {!showForm && (
                    <Button variant="primary" onClick={handleAddClick}>
                        + Agregar Nuevo Producto
                    </Button>
                )}
            </div>

            {showForm ? (
                <div className="admin-products__form-section">
                    <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <ProductForm
                        initialData={editingProduct}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                    />
                </div>
            ) : (
                <div className="admin-products__list-section">
                    <ProductList
                        products={products}
                        loading={loading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteProduct}
                        onQuickStockUpdate={handleQuickStockUpdate}
                    />
                </div>
            )}
        </div>
    );
}
