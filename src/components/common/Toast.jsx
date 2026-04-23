import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Phase 1: Exit animation
        const fadeTimer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        // Phase 2: Call onClose after animation
        const closeTimer = setTimeout(() => {
            onClose();
        }, duration + 300);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(closeTimer);
        };
    }, [duration, onClose]);

    return (
        <div className={`toast toast--${type} ${isVisible ? 'toast--visible' : ''}`}>
            <div className="toast__icon">
                {type === 'success' && '✅'}
                {type === 'error' && '❌'}
                {type === 'info' && 'ℹ️'}
            </div>
            <div className="toast__message">{message}</div>
        </div>
    );
}
