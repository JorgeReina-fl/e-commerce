const mongoose = require('mongoose');

/**
 * ShopConfig Model
 * Stores shop branding configuration in the database
 * Only one document should exist (singleton pattern)
 */

const shopConfigSchema = new mongoose.Schema({
    // Brand Identity
    name: {
        type: String,
        default: 'LuxeThread'
    },
    fullName: {
        type: String,
        default: 'LuxeThread'
    },
    legalName: {
        type: String,
        default: 'LuxeThread S.L.'
    },
    taglinePart1: {
        type: String,
        default: 'Luxe'
    },
    taglinePart2: {
        type: String,
        default: 'Thread'
    },
    tagline: {
        short: { type: String, default: 'Fashion Premium' },
        medium: { type: String, default: 'Moda exclusiva para el individuo moderno' },
        full: { type: String, default: 'Moda exclusiva para el individuo moderno. Calidad, estilo y elegancia atemporal.' }
    },

    // Logo
    logo: {
        url: { type: String, default: null },
        altText: { type: String, default: 'LuxeThread' },
        width: { type: Number, default: 150 },
        height: { type: Number, default: 40 }
    },

    // Color Palette
    colors: {
        primary: {
            light: { type: String, default: '#93C5FD' },
            DEFAULT: { type: String, default: '#2563EB' },
            hover: { type: String, default: '#1D4ED8' },
            dark: { type: String, default: '#1E40AF' }
        },
        secondary: {
            light: { type: String, default: '#E5E7EB' },
            DEFAULT: { type: String, default: '#6B7280' },
            hover: { type: String, default: '#4B5563' },
            dark: { type: String, default: '#374151' }
        },
        accent: {
            light: { type: String, default: '#FEF3C7' },
            DEFAULT: { type: String, default: '#D4A853' },
            hover: { type: String, default: '#B8956C' },
            dark: { type: String, default: '#92400E' }
        },
        success: {
            light: { type: String, default: '#D1FAE5' },
            DEFAULT: { type: String, default: '#059669' },
            dark: { type: String, default: '#065F46' }
        },
        warning: {
            light: { type: String, default: '#FEF3C7' },
            DEFAULT: { type: String, default: '#D97706' },
            dark: { type: String, default: '#92400E' }
        },
        error: {
            light: { type: String, default: '#FEE2E2' },
            DEFAULT: { type: String, default: '#DC2626' },
            dark: { type: String, default: '#991B1B' }
        },
        info: {
            light: { type: String, default: '#DBEAFE' },
            DEFAULT: { type: String, default: '#2563EB' },
            dark: { type: String, default: '#1E40AF' }
        }
    },

    // Typography
    fonts: {
        primary: { type: String, default: 'Inter' },
        display: { type: String, default: 'Outfit' },
        googleFontsUrl: { type: String, default: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap' }
    },

    // SEO
    seo: {
        defaultTitle: { type: String, default: 'LuxeThread - Tienda de Moda Premium' },
        defaultDescription: { type: String, default: 'Tienda de moda premium con las últimas tendencias en ropa y accesorios.' },
        keywords: { type: String, default: 'moda, ropa, accesorios, premium, lujo' },
        ogImage: { type: String, default: '/og-image.jpg' },
        twitterHandle: { type: String, default: '@luxethread' },
        locale: { type: String, default: 'es_ES' }
    },

    // Contact
    contact: {
        email: { type: String, default: 'info@luxethread.com' },
        phone: { type: String, default: '+34 900 000 000' },
        address: { type: String, default: 'Calle Ejemplo 123, Madrid, España' },
        whatsapp: { type: String, default: '+34600000000' }
    },

    // Social Media
    social: {
        instagram: { type: String, default: 'https://instagram.com/luxethread' },
        twitter: { type: String, default: 'https://twitter.com/luxethread' },
        facebook: { type: String, default: 'https://facebook.com/luxethread' },
        tiktok: { type: String, default: null },
        youtube: { type: String, default: null },
        linkedin: { type: String, default: null }
    },

    // Business Settings
    currency: {
        default: { type: String, default: 'EUR' },
        symbol: { type: String, default: '€' },
        available: { type: [String], default: ['EUR', 'USD', 'GBP'] }
    },

    shipping: {
        freeShippingThreshold: { type: Number, default: 50 },
        zones: { type: [String], default: ['España', 'Europa', 'Internacional'] }
    },

    // Feature Flags
    features: {
        wishlist: { type: Boolean, default: true },
        compare: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true },
        multiLanguage: { type: Boolean, default: true },
        multiCurrency: { type: Boolean, default: true },
        darkMode: { type: Boolean, default: true },
        guestCheckout: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Ensure only one config document exists (singleton)
shopConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        // Create default config if none exists
        config = await this.create({});
    }
    return config;
};

// Update config (upsert pattern)
shopConfigSchema.statics.updateConfig = async function (updates) {
    const config = await this.findOneAndUpdate(
        {},
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
    );
    return config;
};

module.exports = mongoose.model('ShopConfig', shopConfigSchema);
