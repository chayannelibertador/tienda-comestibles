import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className = '', style = {} }) => {
    return (
        <div className={`skeleton-pulse ${className}`} style={style}></div>
    );
};

export const ProductSkeletonCard = () => {
    return (
        <div className="product-card skeleton-card">
            <Skeleton className="skeleton-image" />
            <div className="product-info" style={{ padding: '1rem', width: '100%' }}>
                <Skeleton className="skeleton-title" />
                <Skeleton className="skeleton-price" />
                <Skeleton className="skeleton-button" />
            </div>
        </div>
    );
};

export default Skeleton;
