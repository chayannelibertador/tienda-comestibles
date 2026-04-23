import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import './ProductForm.css';

const CATEGORIES = ['Frutas', 'Verduras', 'Panadería', 'Lácteos', 'Bebidas', 'Express'];

export default function ProductForm({ initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        price: '',
        cost: '', // Nuevo campo para costo proveedor
        ivaRate: '21',
        category: 'Frutas',
        image: '',
        description: '',
        stock: '',
        badge: '',
        is_active: true
    });

    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(initialData?.image || '');
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setErrors(prev => ({ ...prev, image: '' }));
        setImagePreview(URL.createObjectURL(file));
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('adminToken');

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error uploading image');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, image: data.url }));

        } catch (err) {
            console.error('Upload Error:', err);
            setErrors(prev => ({ ...prev, image: 'Error al subir imagen al servidor' }));
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.price || formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
        if (formData.cost < 0) newErrors.cost = 'El costo no puede ser negativo'; // Validación de costo
        if (formData.ivaRate === '' || formData.ivaRate < 0) newErrors.ivaRate = 'El IVA debe ser 0 o mayor';
        if (!formData.image.trim()) newErrors.image = 'La imagen/emoji es requerida';
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (!formData.stock || formData.stock < 0) newErrors.stock = 'El stock debe ser 0 o mayor';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const currentPrice = parseFloat(formData.price);
    const currentCost = parseFloat(formData.cost);
    let marginNeto = null;
    if (!isNaN(currentPrice) && !isNaN(currentCost) && currentPrice > 0) {
        marginNeto = ((currentPrice - currentCost) / currentPrice) * 100;
    }
    const suggestedPrice30 = (!isNaN(currentCost) && currentCost > 0) ? (currentCost * 1.3).toFixed(2) : null;

    const handleApplySuggestedPrice = () => {
        if (suggestedPrice30) {
            setFormData(prev => ({ ...prev, price: suggestedPrice30 }));
            if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            const basePrice = parseFloat(formData.price);
            const ivaRate = parseFloat(formData.ivaRate);
            const priceWithIva = basePrice * (1 + ivaRate / 100);

            onSubmit({
                ...formData,
                price: priceWithIva,
                cost: parseFloat(formData.cost) || 0, // Enviar costo
                ivaRate: ivaRate,
                stock: parseInt(formData.stock),
                badge: formData.badge || null,
                is_active: formData.is_active
            });
        }
    };

    return (
        <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="name">Nombre del Producto *</label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Manzanas Orgánicas"
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="price">Precio Base (Sin IVA) *</label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="2500"
                    />
                    {marginNeto !== null && (
                         <div style={{ marginTop: '6px', fontSize: '0.85rem', color: marginNeto < 10 ? '#d32f2f' : '#2e7d32', fontWeight: marginNeto < 10 ? 'bold' : 'normal' }}>
                             Margen neto actual: {marginNeto.toFixed(1)}% 
                             {marginNeto < 10 && marginNeto >= 0 && ' (Baja rentabilidad)'}
                             {marginNeto < 0 && ' (¡Atención: Pérdida!)'}
                             {marginNeto >= 30 && ' (🌟 Producto Estrella)'}
                         </div>
                    )}
                    {suggestedPrice30 && (
                        <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Sugerido 30%: <b>${suggestedPrice30}</b></span>
                            <button type="button" onClick={handleApplySuggestedPrice} style={{ cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius:'4px', padding:'2px 8px', fontSize: '0.8rem' }}>
                                Aplicar sugerido
                            </button>
                        </div>
                    )}
                    {errors.price && <span className="error" style={{marginTop: '4px'}}>{errors.price}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="cost">Costo Proveedor</label>
                    <Input
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="1000"
                    />
                    <small style={{ color: '#666', fontSize: '0.8em' }}>Lo que pagás vos</small>
                    {errors.cost && <span className="error">{errors.cost}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="ivaRate">% IVA *</label>
                    <Input
                        id="ivaRate"
                        name="ivaRate"
                        type="number"
                        step="0.1"
                        value={formData.ivaRate}
                        onChange={handleChange}
                        placeholder="21"
                    />
                    {errors.ivaRate && <span className="error">{errors.ivaRate}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="category">Categoría *</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="badge">Etiqueta Promocional</label>
                    <select
                        id="badge"
                        name="badge"
                        value={formData.badge || ''}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">(Ninguna)</option>
                        <option value="¡Novedad!">¡Novedad!</option>
                        <option value="🔥 Más Vendido">🔥 Más Vendido</option>
                        <option value="⭐️ Recomendado">⭐️ Recomendado</option>
                        <option value="Promo">Promo Especial</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="stock">Stock *</label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="100"
                    />
                    {errors.stock && <span className="error">{errors.stock}</span>}
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '2rem' }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, color: formData.is_active ? '#2e7d32' : '#d32f2f' }}>
                            {formData.is_active ? '✅ Producto Visible' : '⏸️ Producto Pausado / Oculto'}
                        </span>
                    </label>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="image">Imagen del Producto *</label>
                    <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-input"
                    />
                    {errors.image && <span className="error">{errors.image}</span>}
                    {imagePreview && (
                        <div className="image-preview" style={{ marginTop: '10px' }}>
                            {imagePreview.startsWith('http') || imagePreview.startsWith('blob') ? (
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '120px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            ) : (
                                <span style={{ fontSize: '3rem' }}>{imagePreview}</span>
                            )}
                        </div>
                    )}
                    <small className="form-help">Sube una foto. Se comprimirá a WebP automáticamente para máxima velocidad.</small>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="description">Descripción *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="4"
                        placeholder="Descripción detallada del producto..."
                    />
                    {errors.description && <span className="error">{errors.description}</span>}
                </div>
            </div>

            <div className="form-actions">
                <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={uploading}>
                    {uploading ? 'Subiendo imagen...' : initialData ? 'Actualizar Producto' : 'Agregar Producto'}
                </Button>
            </div>
        </form>
    );
}
