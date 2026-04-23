import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AddressForm from '../components/checkout/AddressForm';
import BrandIcon from '../components/common/BrandIcon';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { loginUser, registerUser, loginWithGoogle } = useUser();
    const { addToast } = useToast();

    // 'login' | 'register' | 'address'
    const [mode, setMode] = useState('login');

    // Login Data
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Register Data
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        phone: ''
    });

    const handleLoginChange = (e) => {
        const { id, value } = e.target;
        setLoginData(prev => ({ ...prev, [id]: value }));
    };

    const handleRegisterChange = (e) => {
        const { id, value } = e.target;
        setRegisterData(prev => ({ ...prev, [id]: value }));
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const res = await loginWithGoogle(tokenResponse.access_token);
            if (res.success) {
                addToast(`¡Bienvenido!`);
                navigate('/');
            } else {
                addToast(res.error || 'Error al iniciar sesión con Google.', 'error');
            }
        },
        onError: () => addToast('Error de autenticación con Google', 'error')
    });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        // 1. Try to login
        const res = await loginUser(loginData.email, loginData.password);

        if (res.success) {
            addToast(`¡Bienvenido de nuevo!`);
            navigate('/');
        } else {
            if (res.error === 'Credenciales incorrectas.') {
                 addToast('Contraseña incorrecta o email no registrado', 'error');
            } else {
                 addToast(res.error, 'error');
            }
        }
    };

    const handleRegisterStep1 = (e) => {
        e.preventDefault();
        // Since we removed synchronous checkUserExists, we just move to address step immediately. 
        // The real email unique constraint check happens on the final submit hitting the database.
        setMode('address');
    };

    const handleAddressSubmit = async (addressData) => {
        const res = await registerUser(registerData, addressData);
        if (res.success) {
            addToast(`¡Cuenta creada! Bienvenido, ${registerData.name}`);
            navigate('/');
        } else {
            addToast(res.error || 'Error al registrarte', 'error');
            if (res.error === 'El email ya está registrado.') {
                setMode('login');
            }
        }
    };

    return (
        <div className="login-page page-enter">
            <div className="login-container">

                {/* Header */}
                <div className="login-header" style={{ textAlign: 'left' }}>
                    <div className="login-brand-icon-wrapper">
                        <BrandIcon className="login-brand-icon" />
                    </div>
                    <h1>
                        {mode === 'login' && '👋 ¡Bienvenido!'}
                        {mode === 'register' && '🚀 Crear Cuenta'}
                        {mode === 'address' && '📍 Tu Dirección'}
                    </h1>
                    <p>
                        {mode === 'login' && 'Ingresa tu email y contraseña'}
                        {mode === 'register' && 'Completa tus datos para empezar'}
                        {mode === 'address' && 'Necesitamos saber dónde enviarte tus pedidos'}
                    </p>
                </div>

                {/* Login Form */}
                {mode === 'login' && (
                    <div className="login-step">
                        <form className="login-form" onSubmit={handleLoginSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    placeholder="tu@email.com"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="primary" className="full-width">
                                Iniciar Sesión
                            </Button>
                        </form>

                        <div className="divider">
                            <span>o ingresa con</span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="full-width google-btn"
                            onClick={handleGoogleLogin}
                        >
                            <span className="google-icon">G</span> Iniciar con Google
                        </Button>

                        <div className="divider">
                            <span>¿No tienes cuenta?</span>
                        </div>

                        <Button
                            variant="outline"
                            className="full-width"
                            onClick={() => setMode('register')}
                        >
                            Registrarse
                        </Button>
                    </div>
                )}

                {/* Register Form Step 1 */}
                {mode === 'register' && (
                    <form className="login-form" onSubmit={handleRegisterStep1}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <Input
                                id="email"
                                type="email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Crear Contraseña</label>
                            <Input
                                id="password"
                                type="password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                placeholder="••••••"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Nombre Completo</label>
                            <Input
                                id="name"
                                type="text"
                                value={registerData.name}
                                onChange={handleRegisterChange}
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="age">Edad</label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={registerData.age}
                                    onChange={handleRegisterChange}
                                    placeholder="25"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Teléfono</label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    placeholder="11 ..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button type="button" variant="outline" onClick={() => setMode('login')}>
                                Volver al Login
                            </Button>
                            <Button type="submit" variant="primary">
                                Siguiente →
                            </Button>
                        </div>
                    </form>
                )}

                {/* Register Form Step 2: Address */}
                {mode === 'address' && (
                    <div className="login-step">
                        <AddressForm
                            onSubmit={handleAddressSubmit}
                            onCancel={() => setMode('register')}
                            initialData={{
                                name: registerData.name,
                                phone: registerData.phone
                            }}
                            showName={false}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
