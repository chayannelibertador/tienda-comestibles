import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import './Admin.css';

export default function AdminFailedSearches() {
    const navigate = useNavigate();
    const [searches, setSearches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        fetch('/api/admin/failed-searches', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setSearches(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="admin-products">
            <div className="admin-products__header" style={{ marginBottom: '20px' }}>
                <div>
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        &larr; Volver al Dashboard
                    </Button>
                    <h1 style={{ marginTop: '15px' }}>📈 Oportunidades de Stock</h1>
                    <p style={{ marginTop: '8px', color: '#666' }}>Términos que los clientes intentaron buscar y registraron cero resultados. Considerar abastecer.</p>
                </div>
            </div>

            <div className="admin-products__list-section" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <p>Cargando datos...</p>
                ) : searches.length > 0 ? (
                    <table className="product-list__table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Término Buscado</th>
                                <th>Intentos Fallidos</th>
                                <th>Última Búsqueda Registrada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searches.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 'bold' }}>"{s.term}"</td>
                                    <td>
                                        <span className="stock-badge stock-badge--low" style={{ background: s.search_count > 5 ? '#e11d48' : '#ffe4e6', color: s.search_count > 5 ? '#fff' : '#e11d48', fontWeight: 'bold' }}>
                                            {s.search_count} veces
                                        </span>
                                    </td>
                                    <td style={{ color: '#666' }}>
                                        {new Date(s.last_searched).toLocaleString('es-AR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-message" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        No hay búsquedas fallidas registradas aún. ¡Excelente catálogo!
                    </div>
                )}
            </div>
        </div>
    );
}
