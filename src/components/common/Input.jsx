import { useState } from 'react';
import './Input.css';

export default function Input({ label, id, className = '', type = 'text', ...props }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <div className={`input-wrapper ${isPassword ? 'has-toggle' : ''}`}>
                <input
                    id={id}
                    className="input-field"
                    type={isPassword && showPassword ? 'text' : type}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                )}
            </div>
        </div>
    );
}
