import { createContext, useContext, useEffect, useState } from 'react';
import branding, { injectCSSVariables, generateCSSVariables } from '../config/branding';
import { API_URL } from '../config/api';

/**
 * BrandingContext
 * Fetches branding from API and injects CSS variables dynamically
 * Falls back to local branding.js if API fails
 */
const BrandingContext = createContext(null);

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
};

// Convert API colors format to CSS variables
const injectColorsFromAPI = (colors) => {
    const root = document.documentElement;

    Object.entries(colors).forEach(([colorName, colorValues]) => {
        if (typeof colorValues === 'object') {
            Object.entries(colorValues).forEach(([shade, value]) => {
                const varName = shade === 'DEFAULT'
                    ? `--color-${colorName}`
                    : `--color-${colorName}-${shade}`;
                root.style.setProperty(varName, value);
            });
        }
    });
};

// Inject fonts from API
const injectFontsFromAPI = (fonts) => {
    const root = document.documentElement;
    if (fonts.primary) root.style.setProperty('--font-primary', fonts.primary);
    if (fonts.display) root.style.setProperty('--font-display', fonts.display);
};

export const BrandingProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // Use centralized API_URL
                const response = await fetch(`${API_URL}/config/public`);

                if (!response.ok) {
                    throw new Error('Failed to fetch branding config');
                }

                const data = await response.json();

                // Inject CSS variables from API data
                if (data.colors) {
                    injectColorsFromAPI(data.colors);
                }
                if (data.fonts) {
                    injectFontsFromAPI(data.fonts);
                }

                setConfig(data);
                setError(null);
            } catch (err) {
                console.warn('Failed to fetch branding from API, using defaults:', err.message);
                // Fallback to local branding.js
                injectCSSVariables();
                setConfig({
                    name: branding.name,
                    fullName: branding.fullName,
                    legalName: branding.legalName,
                    taglinePart1: branding.taglinePart1,
                    taglinePart2: branding.taglinePart2,
                    tagline: branding.tagline,
                    logo: branding.logo,
                    contact: branding.contact,
                    social: branding.social,
                    seo: branding.seo,
                    features: branding.features,
                    colors: branding.colors,
                });
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBranding();
    }, []);

    // Show nothing until config is loaded (prevents flash)
    // Or use a loading state if preferred
    if (loading) {
        // Inject default CSS variables immediately to prevent unstyled flash
        injectCSSVariables();
    }

    // Provide branding config to children
    const value = config || {
        name: branding.name,
        fullName: branding.fullName,
        legalName: branding.legalName,
        taglinePart1: branding.taglinePart1,
        taglinePart2: branding.taglinePart2,
        tagline: branding.tagline,
        logo: branding.logo,
        contact: branding.contact,
        social: branding.social,
        seo: branding.seo,
        features: branding.features,
        colors: branding.colors,
        loading,
        error,
    };

    return (
        <BrandingContext.Provider value={{ ...value, loading, error }}>
            {children}
        </BrandingContext.Provider>
    );
};

export default BrandingProvider;
