/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVER-SIDE BRANDING CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file mirrors the client branding config for use in email templates
 * and other server-side rendering needs.
 * 
 * IMPORTANT: Keep this in sync with client/src/config/branding.js
 */

const branding = {
    // Brand Identity
    name: 'LuxeThread',
    fullName: 'LuxeThread',
    legalName: 'LuxeThread S.L.',
    tagline: 'Fashion Premium',

    // Logo (null = use text logo in emails)
    logo: {
        url: null,
        altText: 'LuxeThread',
    },

    // Colors for email templates
    colors: {
        primary: '#2563EB',
        primaryHover: '#1D4ED8',
        primaryLight: '#93C5FD',
        primaryDark: '#1E40AF',

        secondary: '#6B7280',
        accent: '#D4A853',

        // Functional colors
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',

        // Neutrals
        textDark: '#171717',
        textMuted: '#525252',
        textLight: '#737373',
        bgLight: '#F5F5F5',
        border: '#E5E5E5',
    },

    // Contact information
    contact: {
        email: 'info@luxethread.com',
        phone: '+34 900 000 000',
        address: 'Calle Ejemplo 123, Madrid, España',
    },

    // Social media links
    social: {
        instagram: 'https://instagram.com/luxethread',
        twitter: 'https://twitter.com/luxethread',
        facebook: 'https://facebook.com/luxethread',
    },

    // Client URL for links in emails
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

/**
 * Get email header HTML with branding
 */
const getEmailHeader = (title, subtitle = null) => {
    return `
        <div style="background: linear-gradient(135deg, ${branding.colors.primary} 0%, ${branding.colors.primaryDark} 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            ${branding.logo.url
            ? `<img src="${branding.logo.url}" alt="${branding.logo.altText}" style="max-width: 150px; margin-bottom: 20px;">`
            : `<h2 style="margin: 0 0 10px 0; font-size: 24px; letter-spacing: 2px;">${branding.name.toUpperCase()}</h2>`
        }
            <h1 style="margin: 0; font-size: 28px;">${title}</h1>
            ${subtitle ? `<p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 16px;">${subtitle}</p>` : ''}
        </div>
    `;
};

/**
 * Get email footer HTML with branding
 */
const getEmailFooter = (additionalText = null) => {
    const socialLinks = Object.entries(branding.social)
        .filter(([_, url]) => url)
        .map(([platform, url]) => `<a href="${url}" style="color: ${branding.colors.textLight}; text-decoration: none; margin: 0 8px;">${platform}</a>`)
        .join(' | ');

    return `
        <div style="text-align: center; padding: 30px 20px; color: ${branding.colors.textLight}; font-size: 12px; background: ${branding.colors.bgLight}; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 10px 0;">${branding.legalName}</p>
            <p style="margin: 0 0 10px 0;">${branding.contact.address}</p>
            ${socialLinks ? `<p style="margin: 15px 0;">${socialLinks}</p>` : ''}
            ${additionalText ? `<p style="margin: 15px 0 0 0;">${additionalText}</p>` : ''}
            <p style="margin: 15px 0 0 0;">
                <a href="${branding.clientUrl}/unsubscribe" style="color: ${branding.colors.textLight};">Darse de baja</a>
            </p>
        </div>
    `;
};

/**
 * Get styled button HTML
 */
const getEmailButton = (text, url, variant = 'primary') => {
    const bgColor = variant === 'primary' ? branding.colors.primary : branding.colors.secondary;
    return `
        <a href="${url}" 
           style="display: inline-block; padding: 14px 35px; background: ${bgColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            ${text}
        </a>
    `;
};

/**
 * Get base email wrapper
 */
const getEmailWrapper = (content) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: ${branding.colors.textDark}; margin: 0; padding: 20px; background: ${branding.colors.bgLight};">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                ${content}
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    branding,
    getEmailHeader,
    getEmailFooter,
    getEmailButton,
    getEmailWrapper,
};
