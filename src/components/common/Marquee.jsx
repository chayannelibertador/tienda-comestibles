import './Marquee.css';

export default function Marquee() {
    return (
        <div className="marquee-container">
            <div className="marquee-content">
                {/* Original Content */}
                <span>🚚 Envíos GRATIS en toda la localidad 🥬</span>
                <span>✨ Recibí tus productos en la comodidad del hogar ✨</span>

                {/* Dulicated Content for Seamless Loop */}
                <span>🚚 Envíos GRATIS en toda la localidad 🥬</span>
                <span>✨ Recibí tus productos en la comodidad del hogar ✨</span>

                {/* Triplicated Content for Safety on Wide Screens */}
                <span>🚚 Envíos GRATIS en toda la localidad 🥬</span>
                <span>✨ Recibí tus productos en la comodidad del hogar ✨</span>
            </div>
        </div>
    );
}
