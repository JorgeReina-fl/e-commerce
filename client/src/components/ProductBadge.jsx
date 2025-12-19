import React from 'react';
import { Sparkles, Tag, Star, Clock } from 'lucide-react';

const badgeConfig = {
    new: {
        bg: 'bg-green-500',
        text: 'text-white',
        defaultText: 'Nuevo',
        icon: Sparkles
    },
    sale: {
        bg: 'bg-red-500',
        text: 'text-white',
        defaultText: 'Oferta',
        icon: Tag
    },
    featured: {
        bg: 'bg-amber-500',
        text: 'text-white',
        defaultText: 'Destacado',
        icon: Star
    },
    limited: {
        bg: 'bg-orange-500',
        text: 'text-white',
        defaultText: 'Ed. Limitada',
        icon: Clock
    }
};

const ProductBadge = ({ type, text, size = 'sm' }) => {
    const config = badgeConfig[type];
    if (!config) return null;

    const Icon = config.icon;
    const displayText = text || config.defaultText;

    const sizeClasses = {
        xs: 'text-xs px-1.5 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5'
    };

    return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded ${config.bg} ${config.text} ${sizeClasses[size]}`}>
            <Icon size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />
            {displayText}
        </span>
    );
};

// Component to render multiple badges stacked
export const ProductBadges = ({ badges, size = 'sm', maxVisible = 3 }) => {
    if (!badges || badges.length === 0) return null;

    // Filter expired badges
    const now = new Date();
    const activeBadges = badges.filter(badge => !badge.expiresAt || new Date(badge.expiresAt) > now);

    if (activeBadges.length === 0) return null;

    const visibleBadges = activeBadges.slice(0, maxVisible);

    return (
        <div className="flex flex-col gap-1">
            {visibleBadges.map((badge, index) => (
                <ProductBadge
                    key={index}
                    type={badge.type}
                    text={badge.text}
                    size={size}
                />
            ))}
        </div>
    );
};

export default ProductBadge;


