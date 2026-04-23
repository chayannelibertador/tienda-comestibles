import { useState, useEffect } from 'react';
import './PaymentSelector.css';

const PAYMENT_METHODS = [
    {
        id: 'efectivo',
        name: 'Efectivo',
        icon: '💵',
        description: 'Pago contra entrega'
    },
    {
        id: 'transferencia',
        name: 'Transferencia',
        icon: '🏦',
        description: 'Transferencia bancaria'
    },
    // {
    //     id: 'tarjeta',
    //     name: 'Tarjeta',
    //     icon: '💳',
    //     description: 'Crédito o débito'
    // }
];

export default function PaymentSelector({ selected, onSelect, onCardDataChange, cardData }) {
    const [localCardData, setLocalCardData] = useState(cardData || {
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    useEffect(() => {
        if (onCardDataChange && selected === 'tarjeta') {
            onCardDataChange(localCardData);
        }
    }, [localCardData, selected, onCardDataChange]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardInput = (field, value) => {
        let formattedValue = value;

        if (field === 'number') {
            formattedValue = formatCardNumber(value);
        } else if (field === 'expiry') {
            formattedValue = formatExpiry(value.replace('/', ''));
        } else if (field === 'cvv') {
            formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
        }

        setLocalCardData(prev => ({
            ...prev,
            [field]: formattedValue
        }));
    };

    const getCardType = (number) => {
        const cleanNum = number.replace(/\s/g, '');
        if (cleanNum.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(cleanNum)) return 'mastercard';
        if (cleanNum.startsWith('3')) return 'amex';
        return '';
    };

    return (
        <div className="payment-selector-container">
            <div className="payment-selector">
                {PAYMENT_METHODS.map(method => (
                    <label key={method.id} className={`payment-option ${selected === method.id ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={selected === method.id}
                            onChange={() => onSelect(method.id)}
                        />
                        <div className="payment-content">
                            <span className="payment-icon">{method.icon}</span>
                            <div className="payment-info">
                                <span className="payment-name">{method.name}</span>
                                <span className="payment-description">{method.description}</span>
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            {/* Card Form - Show when tarjeta is selected */}
            {selected === 'tarjeta' && (
                <div className="card-form-container">
                    <div className="card-preview">
                        <div className={`card-preview-inner ${getCardType(localCardData.number)}`}>
                            <div className="card-chip">
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                                <div className="chip-main"></div>
                            </div>
                            <div className="card-type-logo">
                                {getCardType(localCardData.number) === 'visa' && '𝗩𝗜𝗦𝗔'}
                                {getCardType(localCardData.number) === 'mastercard' && '●●'}
                                {getCardType(localCardData.number) === 'amex' && 'AMEX'}
                            </div>
                            <div className="card-number-preview">
                                {localCardData.number || '•••• •••• •••• ••••'}
                            </div>
                            <div className="card-details-preview">
                                <div className="card-name-preview">
                                    {localCardData.name || 'NOMBRE DEL TITULAR'}
                                </div>
                                <div className="card-expiry-preview">
                                    {localCardData.expiry || 'MM/YY'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-form">
                        <div className="form-group full-width">
                            <label htmlFor="cardNumber">Número de Tarjeta</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    id="cardNumber"
                                    placeholder="0000 0000 0000 0000"
                                    value={localCardData.number}
                                    onChange={(e) => handleCardInput('number', e.target.value)}
                                    maxLength="19"
                                    autoComplete="cc-number"
                                />
                                <span className="card-icon">💳</span>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="cardName">Nombre del Titular</label>
                            <input
                                type="text"
                                id="cardName"
                                placeholder="Como aparece en la tarjeta"
                                value={localCardData.name}
                                onChange={(e) => handleCardInput('name', e.target.value.toUpperCase())}
                                autoComplete="cc-name"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cardExpiry">Vencimiento</label>
                                <input
                                    type="text"
                                    id="cardExpiry"
                                    placeholder="MM/YY"
                                    value={localCardData.expiry}
                                    onChange={(e) => handleCardInput('expiry', e.target.value)}
                                    maxLength="5"
                                    autoComplete="cc-exp"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cardCvv">CVV</label>
                                <div className="input-with-icon">
                                    <input
                                        type="password"
                                        id="cardCvv"
                                        placeholder="•••"
                                        value={localCardData.cvv}
                                        onChange={(e) => handleCardInput('cvv', e.target.value)}
                                        maxLength="4"
                                        autoComplete="cc-csc"
                                    />
                                    <span className="cvv-tooltip" title="Código de 3 o 4 dígitos al reverso de tu tarjeta">?</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Efectivo info */}
            {selected === 'efectivo' && (
                <div className="payment-info-box efectivo">
                    <div className="info-icon">💵</div>
                    <div className="info-content">
                        <h4>Pago en Efectivo</h4>
                        <p>Podrás pagar al momento de recibir tu pedido. Asegúrate de tener el monto exacto para facilitar el cambio.</p>
                    </div>
                </div>
            )}

            {/* Transferencia info */}
            {selected === 'transferencia' && (
                <div className="payment-info-box transferencia">
                    <div className="info-icon">🏦</div>
                    <div className="info-content">
                        <h4>Transferencia Bancaria</h4>
                        <p>Te enviaremos los datos bancarios por email una vez confirmado el pedido. El pedido se procesará al confirmar el pago.</p>
                        <div className="bank-info">
                            <span>CBU: 0000003100000000000000</span>
                            <span>Alias: ALTOQUEMARKETSHOP</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
