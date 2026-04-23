import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/common/Button';
import BrandIcon from '../components/common/BrandIcon';
import './Contact.css';

export default function Contact() {
    const { settings } = useSettings();
    const [step, setStep] = useState('faq');
    const [activeFaq, setActiveFaq] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const faqs = [
        {
            id: 'envio',
            question: '📦 Estado de mi envío',
            answer: 'Normalmente, los envíos se procesan dentro de las 24 horas hábiles tras confirmar tu pago. Puedes revisar el estado exacto en la sección "Mis Pedidos" o con tu número de seguimiento.'
        },
        {
            id: 'pago',
            question: '💳 Métodos de pago',
            answer: 'Aceptamos transferencias bancarias, tarjetas de crédito/débito y efectivo contra entrega. Todos los pagos en línea son procesados de forma segura.'
        },
        {
            id: 'cobertura',
            question: '📍 Zonas de cobertura',
            answer: 'Realizamos envíos a toda la capital y áreas metropolitanas circundantes. Si vives lejos, contáctanos directo para validar opciones de entrega especiales.'
        }
    ];

    const handleFaqClick = (id) => {
        setActiveFaq(activeFaq === id ? null : id);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Simulamos envío de formulario
        setStep('whatsapp');
    };

    const handleWhatsappClick = () => {
        const phone = settings.phone ? settings.phone.replace(/\D/g, '') : '1234567890';
        const url = `https://wa.me/${phone}?text=Hola,%20necesito%20ayuda%20con%20mi%20consulta.`;
        window.open(url, '_blank');
    };

    return (
        <div className="contact-page page-enter">
            <div className="contact-header">
                <BrandIcon width={60} height={60} />
                <h1>Centro de Ayuda</h1>
                <p>¿En qué podemos ayudarte hoy?</p>
            </div>

            <div className="contact-container">
                {step === 'faq' && (
                    <div className="contact-step faq-step fade-in">
                        <h2>Nivel 1: Respuestas Rápidas</h2>
                        <div className="faq-list">
                            {faqs.map(faq => (
                                <div key={faq.id} className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`}>
                                    <button
                                        className="faq-question"
                                        onClick={() => handleFaqClick(faq.id)}
                                    >
                                        <span>{faq.question}</span>
                                        <span className="faq-icon">{activeFaq === faq.id ? '−' : '+'}</span>
                                    </button>
                                    {activeFaq === faq.id && (
                                        <div className="faq-answer">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="faq-escalate">
                            <p>¿No encontraste lo que buscabas?</p>
                            <Button variant="outline" onClick={() => setStep('form')}>
                                Aún tengo dudas
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'form' && (
                    <div className="contact-step form-step fade-in">
                        <h2>Nivel 2: Déjanos un mensaje</h2>
                        <p className="step-desc">Escríbenos tu duda en detalle y te responderemos a tu correo a la brevedad.</p>
                        
                        <form onSubmit={handleFormSubmit} className="contact-form">
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tu Mensaje</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            
                            <div className="form-actions">
                                <Button type="button" variant="outline" onClick={() => setStep('faq')}>
                                    Volver
                                </Button>
                                <Button type="submit" variant="primary">
                                    Enviar Mensaje
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 'whatsapp' && (
                    <div className="contact-step whatsapp-step fade-in">
                        <h2>Nivel 3: Atención Personalizada</h2>
                        <div className="success-icon">✓</div>
                        <p className="step-desc">
                            Hemos recibido tu mensaje de forma exitosa. 
                            Si tu caso es urgente y todavía necesitas asistencia rápida, 
                            hemos habilitado nuestro contacto directo por WhatsApp para ti.
                        </p>
                        
                        <div className="whatsapp-action">
                            <Button className="btn-whatsapp" onClick={handleWhatsappClick}>
                                💬 Contactar por WhatsApp
                            </Button>
                        </div>

                        <p className="whatsapp-note">Horario de atención: Lunes a Sábado de 9:00 a 18:00 hrs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
