import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
    return (
        <div className="privacy-page page-enter">
            <div className="privacy-container">
                <header className="privacy-header">
                    <div className="privacy-badge">Legal</div>
                    <h1>Política de Privacidad</h1>
                    <p>Última actualización: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="privacy-grid">
                    <section className="privacy-section card">
                        <div className="section-icon">🛡️</div>
                        <h2>Protección de Datos</h2>
                        <p>En <strong>aLToQueMaRKeT</strong>, la seguridad de tu información es nuestra prioridad. Cumplimos estrictamente con la Ley 25.326 de Protección de Datos Personales.</p>
                    </section>

                    <section className="privacy-section card">
                        <div className="section-icon">📊</div>
                        <h2>Información que Recolectamos</h2>
                        <p>Para brindarte el mejor servicio, solicitamos datos básicos como tu nombre, email, teléfono y dirección de entrega. Estos datos son esenciales para procesar y entregar tus pedidos con éxito.</p>
                    </section>

                    <section className="privacy-section card">
                        <div className="section-icon">🔒</div>
                        <h2>Uso y Seguridad</h2>
                        <p>Tus datos se utilizan exclusivamente para la gestión de compras, entregas y comunicación directa sobre tus pedidos. Implementamos medidas de seguridad técnicas para proteger tu información contra cualquier acceso no autorizado.</p>
                    </section>

                    <section className="privacy-section card">
                        <div className="section-icon">🍪</div>
                        <h2>Política de Cookies</h2>
                        <p>Utilizamos cookies para mejorar tu experiencia de navegación, recordar tus preferencias y mantener segura tu sesión de usuario.</p>
                    </section>

                    <section className="privacy-section card full-width">
                        <div className="section-icon">🤝</div>
                        <h2>Tus Derechos</h2>
                        <p>Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos en cualquier momento. Para cualquier consulta sobre tu privacidad, puedes contactarnos a través de nuestros canales oficiales.</p>
                    </section>
                </div>

                <footer className="privacy-disclaimer">
                    <p>Al utilizar este sitio, aceptas nuestra política de privacidad y los términos de uso.</p>
                </footer>
            </div>
        </div>
    );
}
