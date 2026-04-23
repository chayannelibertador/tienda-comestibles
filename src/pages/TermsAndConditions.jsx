import './TermsAndConditions.css';

export default function TermsAndConditions() {
    return (
        <div className="terms-page page-enter">
            <div className="terms-container">
                <header className="terms-header">
                    <div className="terms-badge">Oficial</div>
                    <h1>Términos y Condiciones de Servicio</h1>
                    <p>Al utilizar aLToQueMaRKeT, aceptas los siguientes lineamientos diseñados para proteger tu experiencia y nuestra calidad de servicio.</p>
                </header>

                <div className="terms-content card">
                    <section className="terms-section">
                        <h2>1. Compromiso de Entrega a Domicilio</h2>
                        <p>Nuestra misión es la eficiencia. Nos comprometemos a entregar tus productos en la comodidad de tu hogar en un lapso no mayor a <strong>tres (3) días hábiles</strong> posteriores a la confirmación de la compra.</p>
                        <div className="terms-highlight-green">
                            <strong>Garantía aLToQueMaRKeT:</strong> Si por razones logísticas excedemos el plazo de 3 días, te reintegramos el <strong>5% del valor de tu compra</strong> mediante un cupón de descuento válido para tu próximo pedido.
                        </div>
                    </section>

                    <section className="terms-section">
                        <h2>2. Precios e Impuestos</h2>
                        <p>Los precios mostrados en el catálogo de productos están expresados en Pesos Argentinos (ARS) y <strong>no incluyen el Impuesto al Valor Agregado (IVA)</strong> ni otros cargos adicionales de forma predeterminada.</p>
                        <p>El IVA correspondiente (21%) se sumará de forma transparente en el carrito de compras y será visible durante todo el proceso de checkout, mostrándose el desglose detallado antes de la confirmación final de la compra.</p>
                        <p><strong>Monto Mínimo de Compra:</strong> Para concretar cualquier pedido en aLToQueMaRKeT, el monto total del carrito (sin incluir el envío) debe ser igual o superior a <strong>$15.000 ARS</strong>. Nos reservamos el derecho a modificar este monto mínimo en el futuro sin previo aviso.</p>
                    </section>

                    <section className="terms-section">
                        <h2>3. Cancelaciones y Arrepentimiento</h2>
                        <p>De acuerdo con la Resolución 424/2020 y la Ley 24.240, disponemos de un <strong>Botón de Arrepentimiento</strong> para facilitar la revocación de la compra.</p>
                        <p><strong>Plazo de Cancelación:</strong> Permitimos la cancelación total del pedido con reembolso del 100% dentro de un margen de <strong>3 horas</strong> posteriores a la compra, mientras el pedido se encuentre en estado 'Pendiente'.</p>
                        <div className="terms-highlight-yellow">
                            <strong>Excepción Legal (Art. 1116 CCyC):</strong> Dado que comercializamos productos comestibles y perecederos que pueden deteriorarse con rapidez o cuya naturaleza impide la devolución por razones de seguridad e higiene, estos se encuentran <strong>exceptuados del derecho de revocación de 10 días</strong> una vez que el pedido ha sido despachado o recibido, salvo en casos de fallas de calidad comprobables.
                        </div>
                    </section>

                    <section className="terms-section">
                        <h2>4. Limitación de Responsabilidad</h2>
                        <ul className="terms-list">
                            <li><strong>Información de Productos:</strong> aLToQueMaRKeT no se responsabiliza por errores en la información nutricional o técnica proporcionada por los fabricantes de los productos.</li>
                            <li><strong>Interrupciones:</strong> No seremos responsables por fallas en el servicio derivadas de catástrofes naturales, huelgas de transporte o fallas en proveedores de internet externos.</li>
                            <li><strong>Tope de Responsabilidad:</strong> Nuestra responsabilidad máxima ante cualquier inconveniente directo se limita estrictamente al monto abonado por el cliente por el servicio en cuestión.</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>5. Aceptación del Usuario</h2>
                        <p>El uso de este sitio web y la concreción de una orden de compra implican la aceptación plena e incondicional de estos términos. aLToQueMaRKeT se reserva el derecho de actualizar estos términos para reflejar mejoras en el servicio o cambios legales.</p>
                    </section>
                </div>

                <div className="terms-footer">
                    <p>¿Tienes dudas sobre estos términos? <a href="/contact">Escríbenos</a></p>
                    <p className="copyright">&copy; {new Date().getFullYear()} aLToQueMaRKeT - Calidad y Seguridad Garantizada</p>
                </div>
            </div>
        </div>
    );
}
