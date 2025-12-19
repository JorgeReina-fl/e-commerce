/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BRANDING CONFIGURATION - ZERO-CONFIG CLIENT CUSTOMIZATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file centralizes ALL brand-related settings.
 * To customize for a new client, modify ONLY this file.
 * 
 * ALL colors, fonts, and brand elements throughout the app will update
 * automatically - no other code changes needed.
 */

const branding = {
    // ═══════════════════════════════════════════════════════════════════════
    // BRAND IDENTITY
    // ═══════════════════════════════════════════════════════════════════════
    name: 'LuxeThread',
    taglinePart1: 'Luxe',      // First part of logo (bold)
    taglinePart2: 'Thread',    // Second part of logo (light)

    // Full name variations
    fullName: 'LuxeThread',
    legalName: 'LuxeThread S.L.',

    // Slogan/tagline for different contexts
    tagline: {
        short: 'Fashion Premium',
        medium: 'Moda exclusiva para el individuo moderno',
        full: 'Moda exclusiva para el individuo moderno. Calidad, estilo y elegancia atemporal.'
    },

    // Logo configuration
    logo: {
        url: null,              // URL to logo image (null = use text logo)
        altText: 'LuxeThread',
        width: 150,             // Logo width in pixels
        height: 40,             // Logo height in pixels
    },

    // ═══════════════════════════════════════════════════════════════════════
    // COLOR PALETTE - SEMANTIC COLORS
    // ═══════════════════════════════════════════════════════════════════════
    // These colors are injected as CSS variables and used throughout the app
    colors: {
        // PRIMARY - Main brand color (buttons, links, accents)
        primary: {
            light: '#93C5FD',     // bg-primary-light (hover backgrounds, subtle)
            DEFAULT: '#2563EB',   // bg-primary (main buttons, links)
            hover: '#1D4ED8',     // bg-primary-hover (button hover)
            dark: '#1E40AF',      // text-primary-dark (darker variant)
        },

        // SECONDARY - Supporting brand color
        secondary: {
            light: '#E5E7EB',
            DEFAULT: '#6B7280',
            hover: '#4B5563',
            dark: '#374151',
        },

        // ACCENT - Highlight color (badges, promotions, CTAs)
        accent: {
            light: '#FEF3C7',
            DEFAULT: '#D4A853',   // Gold/champagne accent
            hover: '#B8956C',
            dark: '#92400E',
        },

        // FUNCTIONAL COLORS - Keep these consistent across all clients
        success: {
            light: '#D1FAE5',
            DEFAULT: '#059669',
            dark: '#065F46',
        },
        warning: {
            light: '#FEF3C7',
            DEFAULT: '#D97706',
            dark: '#92400E',
        },
        error: {
            light: '#FEE2E2',
            DEFAULT: '#DC2626',
            dark: '#991B1B',
        },
        info: {
            light: '#DBEAFE',
            DEFAULT: '#2563EB',
            dark: '#1E40AF',
        },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SEO & SOCIAL MEDIA
    // ═══════════════════════════════════════════════════════════════════════
    seo: {
        defaultTitle: 'LuxeThread - Tienda de Moda Premium',
        defaultDescription: 'Tienda de moda premium con las últimas tendencias en ropa y accesorios. Envíos a toda España y Europa.',
        keywords: 'moda, ropa, accesorios, premium, lujo, tendencias',
        ogImage: '/og-image.jpg',
        twitterHandle: '@luxethread',
        locale: 'es_ES'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CONTACT & SOCIAL
    // ═══════════════════════════════════════════════════════════════════════
    contact: {
        email: 'info@luxethread.com',
        phone: '+34 900 000 000',
        address: 'Calle Ejemplo 123, Madrid, España',
        whatsapp: '+34600000000'
    },

    social: {
        instagram: 'https://instagram.com/luxethread',
        twitter: 'https://twitter.com/luxethread',
        facebook: 'https://facebook.com/luxethread',
        tiktok: null,
        youtube: null,
        linkedin: null
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TYPOGRAPHY
    // ═══════════════════════════════════════════════════════════════════════
    fonts: {
        primary: 'Inter',           // Body text
        display: 'Outfit',          // Headings and logo
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BUSINESS SETTINGS
    // ═══════════════════════════════════════════════════════════════════════
    currency: {
        default: 'EUR',
        symbol: '€',
        available: ['EUR', 'USD', 'GBP']
    },

    // Product categories (these should match your backend)
    categories: [
        { id: 'Hombre', label: { es: 'Hombre', en: 'Men' } },
        { id: 'Mujer', label: { es: 'Mujer', en: 'Women' } },
        { id: 'Niños', label: { es: 'Niños', en: 'Kids' } },
        { id: 'Accesorios', label: { es: 'Accesorios', en: 'Accessories' } }
    ],

    // Shipping zones (should match server config)
    shipping: {
        freeShippingThreshold: 50,  // Free shipping above this amount
        zones: ['España', 'Europa', 'Internacional']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FEATURES (enable/disable)
    // ═══════════════════════════════════════════════════════════════════════
    features: {
        wishlist: true,
        compare: true,
        reviews: true,
        newsletter: true,
        multiLanguage: true,
        multiCurrency: true,
        darkMode: true,
        guestCheckout: true
    },

    // ═══════════════════════════════════════════════════════════════════════
    // API ENDPOINTS (for different environments)
    // ═══════════════════════════════════════════════════════════════════════
    api: {
        development: 'http://localhost:5000',
        production: 'https://api.luxethread.com'  // Change for client
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS VARIABLES GENERATOR - DO NOT MODIFY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generates CSS custom properties from the branding colors
 * These are injected into :root by BrandingProvider
 */
export const generateCSSVariables = () => {
    const vars = {};

    // Process color groups
    Object.entries(branding.colors).forEach(([colorName, colorValues]) => {
        if (typeof colorValues === 'object') {
            Object.entries(colorValues).forEach(([shade, value]) => {
                const varName = shade === 'DEFAULT'
                    ? `--color-${colorName}`
                    : `--color-${colorName}-${shade}`;
                vars[varName] = value;
            });
        }
    });

    // Add font variables
    vars['--font-primary'] = branding.fonts.primary;
    vars['--font-display'] = branding.fonts.display;

    return vars;
};

/**
 * Injects CSS variables into the document root
 * Called by BrandingProvider on mount
 */
export const injectCSSVariables = () => {
    const vars = generateCSSVariables();
    const root = document.documentElement;

    Object.entries(vars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
};

/**
 * Gets branding config for emails (subset of data needed by backend)
 * Export this for use in email templates
 */
export const getEmailBranding = () => ({
    name: branding.name,
    legalName: branding.legalName,
    tagline: branding.tagline.short,
    logo: branding.logo.url,
    colors: {
        primary: branding.colors.primary.DEFAULT,
        primaryHover: branding.colors.primary.hover,
        primaryLight: branding.colors.primary.light,
        accent: branding.colors.accent.DEFAULT,
    },
    contact: branding.contact,
    social: branding.social,
});

// Export individual parts for easy access
export const {
    name,
    taglinePart1,
    taglinePart2,
    fullName,
    legalName,
    tagline,
    logo,
    colors,
    seo,
    contact,
    social,
    fonts,
    currency,
    categories,
    shipping,
    features,
    api
} = branding;

export default branding;
