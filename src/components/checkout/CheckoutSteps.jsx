import './CheckoutSteps.css';

const STEPS = [
    { number: 1, label: 'Carrito', icon: '🛒' },
    { number: 2, label: 'Dirección', icon: '📍' },
    { number: 3, label: 'Confirmar', icon: '✓' },
    { number: 4, label: 'Pagar', icon: '💳' }
];

export default function CheckoutSteps({ currentStep }) {
    return (
        <div className="checkout-steps">
            {STEPS.map((step, index) => (
                <div key={step.number} className="step-wrapper">
                    <div className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                        <div className="step-icon">
                            {currentStep > step.number ? '✓' : step.icon}
                        </div>
                        <div className="step-label">{step.label}</div>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className={`step-line ${currentStep > step.number ? 'completed' : ''}`}></div>
                    )}
                </div>
            ))}
        </div>
    );
}
