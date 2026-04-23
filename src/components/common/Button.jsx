import './Button.css';

export default function Button({ children, variant = 'primary', onClick, type = 'button', className = '', disabled = false, style, fullWidth }) {
    return (
        <button
            type={type}
            className={`btn btn--${variant} ${fullWidth ? 'btn--full-width' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
            style={style}
        >
            {children}
        </button>
    );
}
