import { useState, useRef } from 'react';
import { useTestimonials } from '../context/TestimonialsContext';

import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import './AdminTestimonials.css';

export default function AdminTestimonials() {
    const { testimonials, addTestimonial, deleteTestimonial, loading } = useTestimonials();

    const { addToast } = useToast();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        comment: '',
        avatar: ''
    });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                addToast('La imagen es muy pesada. Máximo 500KB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setFormData(prev => ({
                    ...prev,
                    avatar: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addTestimonial(formData);
            setFormData({ name: '', comment: '', avatar: '' });
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este testimonio?')) {
            await deleteTestimonial(id);
        }
    };

    return (
        <div className="admin-testimonials">
            <h2 className="admin-title">Administrar Testimonios</h2>

            <div className="admin-grid">
                {/* Formulario */}
                <div className="admin-card">
                    <h3>Agregar Nuevo Testimonio</h3>
                    <form onSubmit={handleSubmit} className="testimonial-form">
                        <Input
                            label="Nombre del Cliente"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />

                        <div className="form-group">
                            <label>Comentario</label>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Foto (Opcional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="file-input"
                            />
                        </div>

                        {preview && (
                            <div className="image-preview">
                                <img src={preview} alt="Vista previa" />
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={submitting || loading}
                            fullWidth
                        >
                            {submitting ? 'Guardando...' : 'Guardar Testimonio'}
                        </Button>
                    </form>
                </div>

                {/* Lista */}
                <div className="admin-card">
                    <h3>Testimonios Activos ({testimonials.length})</h3>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="testimonials-list">
                            {testimonials.map(testimonial => (
                                <div key={testimonial.id || testimonial._id} className="testimonial-item">
                                    <div className="testimonial-header">
                                        {testimonial.avatar ? (
                                            <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar-sm" />
                                        ) : (
                                            <div className="testimonial-avatar-placeholder">{testimonial.name[0]}</div>
                                        )}
                                        <div>
                                            <h4>{testimonial.name}</h4>
                                            <small>{new Date(testimonial.created_at || testimonial.createdAt || Date.now()).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <p className="testimonial-text">"{testimonial.comment}"</p>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(testimonial.id || testimonial._id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            {testimonials.length === 0 && (
                                <p className="empty-state">No hay testimonios registrados.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
