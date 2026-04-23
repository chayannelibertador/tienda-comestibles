import React from 'react';
import './Marquee.css';

export default function Marquee() {
    return (
        <div className="marquee">
            <div className="marquee__content">
                <span>🚚 Envíos gratis en compras superiores a $25.000</span>
                <span>✨ 20% OFF en tu primera compra con crédito</span>
                <span>🍎 Productos frescos directos del productor</span>
            </div>
        </div>
    );
}
