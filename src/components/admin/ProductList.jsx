import { useState } from 'react';
import Button from '../common/Button';
import './ProductList.css';

const CATEGORY_OPTIONS = ['Todos', 'Frutas', 'Verduras', 'Panadería', 'Lácteos', 'Bebidas', 'Express'];

export default function ProductList({ 
    products, loading, 
    searchTerm, onSearchChange, 
    categoryFilter, onCategoryChange,
    currentPage, totalPages, onPageChange,
    onEdit, onDelete, onQuickStockUpdate
}) {
    // Ya no filtramos localmente, el servidor nos da la lista filtrada
    const filteredProducts = products;

    const handleDelete = (product) => {
        if (window.confirm(`¿Estás seguro de ocultar/pausar "${product.name}"? (No se eliminará por completo)`)) {
            onDelete(product._id || product.id);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="product-list">
            <div className="product-list__filters">
                <input
                    type="text"
                    placeholder="Buscar producto en servidor..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="filter-search"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="filter-select"
                >
                    {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="product-list__table-wrapper">
                <table className="product-list__table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Skeleton rows
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={`skeleton-${index}`} className="skeleton-row">
                                    <td><div className="skeleton-box skeleton-image"></div></td>
                                    <td><div className="skeleton-box skeleton-text"></div></td>
                                    <td><div className="skeleton-box skeleton-badge"></div></td>
                                    <td><div className="skeleton-box skeleton-text-short"></div></td>
                                    <td><div className="skeleton-box skeleton-text-short"></div></td>
                                    <td><div className="skeleton-box skeleton-badge"></div></td>
                                    <td>
                                        <div className="skeleton-box skeleton-btn"></div>
                                        <div className="skeleton-box skeleton-btn"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-message">
                                    No se encontraron productos
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product._id || product.id} style={{ opacity: product.is_active ? 1 : 0.6 }}>
                                    <td className="product-image-cell">{product.image}</td>
                                    <td className="product-name-cell">{product.name}</td>
                                    <td>
                                        <span style={{ 
                                            background: product.is_active ? '#e8f5e9' : '#ffebee', 
                                            color: product.is_active ? '#2e7d32' : '#c62828',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                                        }}>
                                            {product.is_active ? 'Activo' : 'Oculto'}
                                        </span>
                                    </td>
                                    <td>{product.category}</td>
                                    <td className="price-cell">{formatPrice(product.price)}</td>
                                    <td className="stock-cell">
                                        <div 
                                            className={`stock-badge ${product.stock === 0 ? 'stock-badge--out' : product.stock <= 5 ? 'stock-badge--low' : 'stock-badge--ok'}`}
                                            title={product.stock <= 5 ? 'Quiebre de stock: considerar reponer' : ''}
                                        >
                                            {product.stock <= 5 && <span style={{marginRight: '4px'}}>⚠️</span>}
                                            {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                                        </div>
                                        <div className="quick-stock-actions">
                                            <button className="quick-stock-btn" onClick={() => onQuickStockUpdate(product, 1)} title="Sumar 1 unidad">+1</button>
                                            <button className="quick-stock-btn" onClick={() => onQuickStockUpdate(product, 12)} title="Sumar bulto (12)">+12</button>
                                            <button className="quick-stock-btn" onClick={() => onQuickStockUpdate(product, 24)} title="Sumar bulto (24)">+24</button>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <Button
                                            variant="outline"
                                            className="btn-sm"
                                            onClick={() => onEdit(product)}
                                        >
                                            Editar
                                        </Button>
                                        {product.is_active && (
                                            <Button
                                                variant="outline"
                                                className="btn-sm btn-danger-outline"
                                                onClick={() => handleDelete(product)}
                                            >
                                                Pausar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="product-list__summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pagination-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Button 
                        variant="outline" 
                        disabled={currentPage <= 1 || loading}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="btn-sm"
                    >
                        Anterior
                    </Button>
                    <span>Página {currentPage} de {Math.max(1, totalPages)}</span>
                    <Button 
                        variant="outline" 
                        disabled={currentPage >= totalPages || loading}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="btn-sm"
                    >
                        Siguiente
                    </Button>
                </div>
                <div>
                    Mostrando resultados del servidor
                </div>
            </div>
        </div>
    );
}
