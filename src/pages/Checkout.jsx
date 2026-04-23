import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useToast } from '../context/ToastContext';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import AddressForm from '../components/checkout/AddressForm';
import PaymentSelector from '../components/checkout/PaymentSelector';
import Button from '../components/common/Button';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const { user, addresses, getDefaultAddress, addAddress } = useUser();
    const { cart, subtotal, totalIVA, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
    const { createOrder } = useOrders();
    const { addToast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [paymentStep, setPaymentStep] = useState('select'); // select, processing, confirmed
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Mañana (08:00 a 13:00 hs)');

    // Redirect validations
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (cart.length === 0 && !orderSuccess) {
            navigate('/cart');
        } else if (totalPrice < 15000 && !orderSuccess) {
            navigate('/cart');
        }
    }, [user, cart, totalPrice, navigate, orderSuccess, addToast]);

    // Show loading state while validating
    if ((!user || cart.length === 0 || totalPrice < 15000) && !orderSuccess) {
        return (
            <div className="checkout page-enter" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p>Cargando checkout...</p>
            </div>
        );
    }

    const handleNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!selectedAddress && addresses.length > 0) {
                // Auto-select default if available
                const defaultAddr = getDefaultAddress() || addresses[0];
                setSelectedAddress(defaultAddr);
                setCurrentStep(3);
                return;
            }
            if (!selectedAddress) {
                addToast('Por favor agrega una dirección de envío', 'error');
                return;
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Step 3 is now Confirmation - proceed to Payment
            setCurrentStep(4);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setShowAddressForm(false);
            if (currentStep === 4) {
                setPaymentStep('select');
            }
        }
    };

    const handleEdit = (step) => {
        setCurrentStep(step);
    };

    const handleAddressSubmit = (addressData) => {
        const newAddress = addAddress(addressData);
        setSelectedAddress(newAddress);
        setShowAddressForm(false);
    };

    const isCardDataValid = () => {
        const { number, expiry, cvv, name } = cardData;
        const cleanNumber = number.replace(/\s/g, '');
        return (
            cleanNumber.length >= 15 &&
            expiry.length === 5 &&
            cvv.length >= 3 &&
            name.trim().length >= 3
        );
    };

    const canProceedWithPayment = () => {
        if (!paymentMethod) return false;
        if (paymentMethod === 'tarjeta' && !isCardDataValid()) return false;
        return true;
    };

    const handleProcessPayment = async () => {
        if (!canProceedWithPayment()) {
            if (!paymentMethod) {
                addToast('Por favor selecciona un método de pago', 'error');
            } else if (paymentMethod === 'tarjeta' && !isCardDataValid()) {
                addToast('Por favor completa todos los datos de la tarjeta', 'error');
            }
            return;
        }

        setPaymentStep('processing');
        setIsProcessing(true);

        // Llamar al servidor para descontar stock de forma atómica
        let serverOrder;
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    subtotal,
                    iva: totalIVA,
                    total: totalPrice,
                    shippingAddress: {
                        ...(selectedAddress || {}),
                        timeSlot: deliveryTimeSlot
                    },
                    paymentMethod,
                    userId: user?.email || 'guest',
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                // 409 = stock insuficiente
                setIsProcessing(false);
                setPaymentStep('select');
                addToast(errData.error || 'Error al procesar el pedido', 'error');
                return;
            }

            serverOrder = await response.json();
        } catch {
            setIsProcessing(false);
            setPaymentStep('select');
            addToast('No se pudo conectar con el servidor. Intentá de nuevo.', 'error');
            return;
        }

        // Pago confirmado visualmente
        setPaymentStep('confirmed');

        setTimeout(() => {
            // Guardar orden en localStorage (historial del usuario)
            const order = createOrder({
                ...serverOrder,
                id: serverOrder.id,
            });

            if (order && order.id) {
                setOrderSuccess(true);
                clearCart();
                setIsProcessing(false);
                navigate(`/order-confirmation/${order.id}`);
            } else {
                setIsProcessing(false);
                setPaymentStep('select');
                addToast('Error al registrar la orden', 'error');
            }
        }, 1500);
    };

    const handleWhatsAppCheckout = async () => {
        if (!selectedAddress) {
            addToast('Por favor selecciona una dirección de envío', 'error');
            return;
        }

        setPaymentStep('processing');
        setIsProcessing(true);

        let serverOrder;
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    subtotal,
                    iva: totalIVA,
                    total: totalPrice,
                    shippingAddress: {
                        ...(selectedAddress || {}),
                        timeSlot: deliveryTimeSlot
                    },
                    paymentMethod: 'whatsapp',
                    userId: user?.email || 'guest',
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                setIsProcessing(false);
                setPaymentStep('select');
                addToast(errData.error || 'Error al procesar el pedido', 'error');
                return;
            }

            serverOrder = await response.json();
        } catch {
            setIsProcessing(false);
            setPaymentStep('select');
            addToast('No se pudo conectar con el servidor. Intentá de nuevo.', 'error');
            return;
        }

        setPaymentStep('confirmed');

        setTimeout(() => {
            const order = createOrder({
                ...serverOrder,
                id: serverOrder.id,
            });

            if (order && order.id) {
                setOrderSuccess(true);
                clearCart();
                setIsProcessing(false);
                
                const phone = '3434166657';
                
                const itemsList = cart.map(item => `- ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`).join('\n');
                const addressStr = selectedAddress ? `${selectedAddress.street} ${selectedAddress.number}${selectedAddress.floor ? ` (Piso/Depto ${selectedAddress.floor})` : ''}, ${selectedAddress.city}\n*⏱️ Franja horaria:* ${deliveryTimeSlot}` : `A acordar\n*⏱️ Franja horaria:* ${deliveryTimeSlot}`;
                
                const message = `*🌟 ¡Hola! Quiero confirmar un pedido*\n\n` + 
                                `*📦 Pedido ID:* #${order.id}\n` +
                                `*👤 A nombre de:* ${user?.name || 'Cliente'}\n` +
                                `*🚚 Entrega en:* ${addressStr}\n\n` +
                                `*🛒 Detalle de productos:*\n${itemsList}\n\n` +
                                `*💰 Total a pagar:* ${formatPrice(totalPrice)}\n\n` +
                                `¡Aguardamos su respuesta para coordinar!`;
                                
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                
                navigate(`/order-confirmation/${order.id}`);
            } else {
                setIsProcessing(false);
                setPaymentStep('select');
                addToast('Error al registrar la orden', 'error');
            }
        }, 1500);
    };

    const formatPrice = (price) => {
        try {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
            }).format(price || 0);
        } catch (e) {
            return '$0';
        }
    };

    const getPaymentButtonText = () => {
        if (paymentStep === 'processing') return 'Procesando pago...';
        if (paymentStep === 'confirmed') return '¡Pago confirmado!';

        switch (paymentMethod) {
            case 'tarjeta':
                return `Pagar ${formatPrice(totalPrice)}`;
            case 'efectivo':
                return 'Confirmar Pedido (Pago contra entrega)';
            case 'transferencia':
                return 'Confirmar Pedido (Pago por transferencia)';
            default:
                return 'Confirmar Pedido';
        }
    };

    return (
        <div className="checkout page-enter">
            <div className="checkout__container">
                <h1>Finalizar Compra</h1>

                <CheckoutSteps currentStep={currentStep} />

                <div className="checkout__content">
                    {/* Loading Overlay for Payment Processing */}
                    {isProcessing && (
                        <div className="checkout-overlay">
                            <div className={`payment-animation ${paymentStep}`}>
                                {paymentStep === 'processing' && (
                                    <>
                                        <div className="payment-spinner">
                                            <div className="spinner-ring"></div>
                                            <div className="spinner-icon">💳</div>
                                        </div>
                                        <h3>Procesando tu pago...</h3>
                                        <p>Por favor no cierres esta ventana</p>
                                    </>
                                )}
                                {paymentStep === 'confirmed' && (
                                    <>
                                        <div className="success-animation">
                                            <div className="success-checkmark">✓</div>
                                        </div>
                                        <h3>¡Pago confirmado!</h3>
                                        <p>Preparando tu pedido...</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Cart Summary (Editable) */}
                    {currentStep === 1 && (
                        <div className="checkout__step">
                            <h2>Resumen del Pedido</h2>
                            <div className="order-summary">
                                {cart.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <span className="item-image">{item.image}</span>
                                        <div className="item-details">
                                            <span className="item-name">{item.name}</span>
                                            <div className="qty-controls-mini">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="qty-btn"
                                                    disabled={item.quantity <= 1}
                                                >-</button>
                                                <span className="item-quantity">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="qty-btn"
                                                >+</button>
                                            </div>
                                        </div>
                                        <div className="item-actions-right">
                                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                            <button
                                                className="delete-btn-mini"
                                                onClick={() => removeFromCart(item.id)}
                                                title="Eliminar"
                                            >🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="summary-total-breakdown">
                                    <div className="summary-total">
                                        <span>Total:</span>
                                        <span className="total-price">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Shipping Address */}
                    {currentStep === 2 && (
                        <div className="checkout__step">
                            <h2>Dirección de Envío</h2>
                            {showAddressForm ? (
                                <AddressForm
                                    onSubmit={handleAddressSubmit}
                                    onCancel={() => setShowAddressForm(false)}
                                />
                            ) : (
                                <div className="address-selection">
                                    {addresses.length === 0 ? (
                                        <div className="no-addresses">
                                            <p>No tienes direcciones guardadas</p>
                                            <Button variant="primary" onClick={() => setShowAddressForm(true)}>
                                                Agregar Dirección
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="address-list">
                                                {addresses.map(addr => (
                                                    <label key={addr.id} className={`address-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="address"
                                                            checked={selectedAddress?.id === addr.id}
                                                            onChange={() => setSelectedAddress(addr)}
                                                        />
                                                        <div className="address-info">
                                                            <strong>{addr.name}</strong>
                                                            <p>{addr.street} {addr.number} {addr.floor}</p>
                                                            <p>{addr.city}, {addr.province} ({addr.postalCode})</p>
                                                            <p>Tel: {addr.phone}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            <Button variant="outline" onClick={() => setShowAddressForm(true)}>
                                                + Usar Nueva Dirección
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Confirmation (Now before payment) */}
                    {currentStep === 3 && (
                        <div className="checkout__step">
                            <h2>Confirmar Datos del Pedido</h2>
                            <div className="order-confirmation">
                                <div className="confirmation-row">
                                    <div className="confirmation-section">
                                        <div className="confirmation-header">
                                            <h3>Productos ({cart.length})</h3>
                                            <button className="edit-btn" onClick={() => handleEdit(1)}>Editar</button>
                                        </div>
                                        {cart.map(item => (
                                            <div key={item.id} className="confirmation-item">
                                                <span>{item.name} <small>x{item.quantity}</small></span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="confirmation-section">
                                        <div className="confirmation-header">
                                            <h3>Mis Datos</h3>
                                            <button className="edit-btn" onClick={() => navigate('/profile')}>Ver Perfil</button>
                                        </div>
                                        <p><strong>{user?.name}</strong></p>
                                        <p>{user?.email}</p>
                                        <p>{user?.phone}</p>
                                    </div>

                                    <div className="confirmation-section">
                                        <div className="confirmation-header">
                                            <h3>Envío</h3>
                                            <button className="edit-btn" onClick={() => handleEdit(2)}>Cambiar</button>
                                        </div>
                                        {selectedAddress ? (
                                            <>
                                                <p><strong>{selectedAddress.name}</strong></p>
                                                <p>{selectedAddress.street} {selectedAddress.number} {selectedAddress.floor}</p>
                                            </>
                                        ) : (
                                            <p className="error">Seleccione una dirección</p>
                                        )}
                                    </div>
                                </div>

                                <div className="confirmation-total-breakdown">
                                    <div className="total-row final">
                                        <span>Total a Pagar:</span>
                                        <span className="final-price">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="confirmation-note" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🚚</span>
                                        <strong style={{ fontSize: '1.1rem' }}>Logística de Entrega (72hs)</strong>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '1.05rem', marginBottom: '1rem' }}>
                                        Tu pedido será entregado el <strong>
                                            {new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
                                        </strong>. Por favor seleccioná tu franja horaria:
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="radio" 
                                                name="timeSlot" 
                                                value="Mañana (08:00 a 13:00 hs)" 
                                                checked={deliveryTimeSlot === 'Mañana (08:00 a 13:00 hs)'}
                                                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                                            />
                                            <span>🌅 Mañana (08:00 a 13:00 hs)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="radio" 
                                                name="timeSlot" 
                                                value="Tarde (16:00 a 20:00 hs)" 
                                                checked={deliveryTimeSlot === 'Tarde (16:00 a 20:00 hs)'}
                                                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                                            />
                                            <span>🌇 Tarde (16:00 a 20:00 hs)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment Method (Now last step) */}
                    {currentStep === 4 && !isProcessing && (
                        <div className="checkout__step">
                            <h2>Método de Pago</h2>
                            <PaymentSelector
                                selected={paymentMethod}
                                onSelect={setPaymentMethod}
                                onCardDataChange={setCardData}
                                cardData={cardData}
                            />

                            <div className="payment-summary">
                                <div className="payment-summary-total">
                                    <span>Total a pagar:</span>
                                    <span className="payment-amount">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            {/* Gatillo de confianza local */}
                            <div style={{
                                marginTop: '1.25rem',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                                border: '1.5px solid #bbf7d0',
                                borderRadius: '12px',
                                padding: '1rem 1.25rem',
                                display: 'flex',
                                gap: '0.9rem',
                                alignItems: 'flex-start'
                            }}>
                                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🚲</span>
                                <div>
                                    <p style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '1rem', color: '#166534' }}>
                                        Entrega a domicilio gratis en Libertador San Martín
                                    </p>
                                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', color: '#1e40af' }}>
                                        📦 Recibís tu pedido en <strong>menos de 72hs</strong>. Podés <strong>pagar al recibir</strong> si preferís, sin complicaciones.
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                                        Somos del barrio. Tu pedido lo llevamos nosotros personalmente. 🤝
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="checkout__actions">
                    <div className="action-left">
                        {currentStep > 1 && !showAddressForm && !isProcessing && (
                            <Button variant="outline" onClick={handlePreviousStep}>
                                ← Atrás
                            </Button>
                        )}
                    </div>
                    <div className="action-right">
                        {currentStep < 4 && !showAddressForm && (
                            <Button variant="primary" onClick={handleNextStep}>
                                Continuar →
                            </Button>
                        )}
                        {currentStep === 4 && !isProcessing && (
                            <div className="payment-action-buttons">
                                <Button
                                    variant="outline"
                                    onClick={handleWhatsAppCheckout}
                                    style={{ borderColor: '#25D366', color: '#25D366', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}
                                >
                                    <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> Finalizar por WhatsApp
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleProcessPayment}
                                    disabled={!canProceedWithPayment()}
                                    className={`pay-button ${paymentMethod}`}
                                >
                                    {getPaymentButtonText()}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
