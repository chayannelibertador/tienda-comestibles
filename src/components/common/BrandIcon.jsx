import React from 'react';
import brandIcon from '../../assets/brand-icon.png';

export default function BrandIcon({ className = '', ...props }) {
    return (
        <img
            src={brandIcon}
            alt="AltoqueMarket"
            className={className}
            {...props}
        />
    );
}
