import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './AdminLogin.css';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { loginAdmin, isAdmin } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Si ya está logueado como admin, redirigir al dashboard
    useEffect(() => {
        if (isAdmin()) {
            navigate('/admin');
        }
    }, [isAdmin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await loginAdmin(email, password);
        if (success) {
            navigate('/admin');
        } else {
            setError('Credenciales incorrectas. Intenta nuevamente.');
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login__container">
                <div className="admin-login__header">
                    <h1>🔐 Acceso Administrativo</h1>
                    <p>Ingresa tus credenciales para acceder al panel</p>
                </div>

                <form className="admin-login__form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <Button type="submit" variant="primary" className="full-width">
                        Iniciar Sesión
                    </Button>
                </form>

                <div className="admin-login__footer">
                    <a href="/" className="back-link">← Volver a la tienda</a>
                </div>

            </div>
        </div>
    );
}
