import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import Button from '../components/common/Button';
import './Admin.css';

export default function Admin() {
    const navigate = useNavigate();
    const { products } = useProducts();

    // Calculate statistics
    const totalProducts = products.length;
    const categories = [...new Set(products.map(p => p.category))];
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    const stats = [
        { label: 'Total Productos', value: totalProducts, icon: '📦' },
        { label: 'Categorías', value: categories.length, icon: '🏷️' },
        { label: 'Stock Total', value: totalStock, icon: '📊' },
        { label: 'Stock Bajo', value: lowStockProducts, icon: '⚠️' },
    ];

    return (
        <div className="admin">
            <div className="admin__header">
                <h1>Panel de Administración</h1>
                <p>Gestiona tu tienda desde aquí</p>
            </div>

            <div className="admin__stats">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin__actions">
                <div className="action-card">
                    <h3>📦 Gestión de Productos</h3>
                    <p>Agregar, editar y eliminar productos del catálogo</p>
                    <Button variant="primary" onClick={() => navigate('/admin/products')}>
                        Administrar Productos
                    </Button>
                </div>

                <div className="action-card">
                    <h3>📊 Pedidos</h3>
                    <p>Ver y gestionar los pedidos de los clientes</p>
                    <Button variant="secondary" onClick={() => navigate('/admin/orders')}>
                        Gestionar Pedidos
                    </Button>
                </div>

                <div className="action-card">
                    <h3>⚙️ Configuración</h3>
                    <p>Administrar datos de la tienda y redes</p>
                    <Button variant="secondary" onClick={() => navigate('/admin/settings')}>
                        Editar Configuración
                    </Button>
                </div>

                <div className="action-card">
                    <h3>💬 Testimonios</h3>
                    <p>Administrar comentarios de clientes</p>
                    <Button variant="secondary" onClick={() => navigate('/admin/testimonials')}>
                        Gestionar Testimonios
                    </Button>
                </div>

                <div className="action-card">
                    <h3>📉 Oportunidades</h3>
                    <p>Ver qué buscan los clientes y no encuentran (Búsquedas fallidas)</p>
                    <Button variant="primary" onClick={() => navigate('/admin/failed-searches')} style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}>
                        Ver Oportunidades
                    </Button>
                </div>
            </div>
        </div>
    );
}
