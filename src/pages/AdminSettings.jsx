import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import './AdminSettings.css';

export default function AdminSettings() {
    const navigate = useNavigate();
    const { settings, updateSettings } = useSettings();
    const { addToast } = useToast();

    const [formData, setFormData] = useState(settings);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSettings(formData);
        addToast('Configuración actualizada correctamente', 'success');
        navigate('/admin');
    };

    return (
        <div className="admin-settings page-enter">
            <div className="settings-container">
                <div className="settings-header">
                    <h1>⚙️ Configuración del Sitio</h1>
                    <p>Edita la información pública de tu tienda</p>
                </div>

                <form className="settings-form" onSubmit={handleSubmit}>
                    <section className="settings-section">
                        <h3>📞 Contacto</h3>
                        <div className="form-group">
                            <label htmlFor="phone">Teléfono / WhatsApp</label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email de Contacto</label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Dirección del Local</label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>🌐 Redes Sociales</h3>
                        <div className="form-group">
                            <label htmlFor="instagram">Instagram (URL)</label>
                            <Input
                                id="instagram"
                                value={formData.instagram}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="facebook">Facebook (URL)</label>
                            <Input
                                id="facebook"
                                value={formData.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>🏪 General</h3>
                        <div className="form-group">
                            <label htmlFor="storeName">Nombre de la Tienda</label>
                            <Input
                                id="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
