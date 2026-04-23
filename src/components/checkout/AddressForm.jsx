import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import './AddressForm.css';

const PROVINCIAS = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
];

export default function AddressForm({ initialData, onSubmit, onCancel, showName = true }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        street: '',
        number: '',
        floor: '',
        city: '',
        province: 'Buenos Aires',
        postalCode: '',
        phone: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.street.trim()) newErrors.street = 'La calle es requerida';
        if (!formData.number.trim()) newErrors.number = 'El número es requerido';
        if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'El código postal es requerido';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form className="address-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                {showName && (
                    <div className="form-group full-width">
                        <label htmlFor="name">Nombre completo *</label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Juan Pérez"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="street">Calle *</label>
                    <Input
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Av. Corrientes"
                    />
                    {errors.street && <span className="error">{errors.street}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="number">Número *</label>
                    <Input
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        placeholder="1234"
                    />
                    {errors.number && <span className="error">{errors.number}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="floor">Piso/Depto</label>
                    <Input
                        id="floor"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        placeholder="5° A"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="city">Ciudad *</label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Buenos Aires"
                    />
                    {errors.city && <span className="error">{errors.city}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="province">Provincia *</label>
                    <select
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {PROVINCIAS.map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="postalCode">Código Postal *</label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="1234"
                    />
                    {errors.postalCode && <span className="error">{errors.postalCode}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Teléfono *</label>
                    <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+54 11 1234-5678"
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                </div>

                <div className="form-group full-width">
                    <label htmlFor="notes">Notas adicionales</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="3"
                        placeholder="Ej: Timbre roto, tocar puerta"
                    />
                </div>
            </div>

            <div className="form-actions">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary">
                    {initialData ? 'Actualizar Dirección' : 'Guardar Dirección'}
                </Button>
            </div>
        </form>
    );
}
