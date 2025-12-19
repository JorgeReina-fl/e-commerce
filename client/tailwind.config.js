/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // =============================================
            // TIPOGRAFÍA PREMIUM
            // =============================================
            fontFamily: {
                sans: ['var(--font-primary)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['var(--font-display)', 'Outfit', 'Inter', 'sans-serif'],
            },

            // =============================================
            // SEMANTIC COLORS - REFERENCED VIA CSS VARIABLES
            // =============================================
            colors: {
                // Primary brand color (buttons, links, accents)
                primary: {
                    light: 'var(--color-primary-light)',
                    DEFAULT: 'var(--color-primary)',
                    hover: 'var(--color-primary-hover)',
                    dark: 'var(--color-primary-dark)',
                },

                // Secondary brand color
                secondary: {
                    light: 'var(--color-secondary-light)',
                    DEFAULT: 'var(--color-secondary)',
                    hover: 'var(--color-secondary-hover)',
                    dark: 'var(--color-secondary-dark)',
                },

                // Accent color (highlights, promotions)
                accent: {
                    light: 'var(--color-accent-light)',
                    DEFAULT: 'var(--color-accent)',
                    hover: 'var(--color-accent-hover)',
                    dark: 'var(--color-accent-dark)',
                },

                // Functional colors (consistent across all clients)
                success: {
                    light: 'var(--color-success-light)',
                    DEFAULT: 'var(--color-success)',
                    dark: 'var(--color-success-dark)',
                },
                warning: {
                    light: 'var(--color-warning-light)',
                    DEFAULT: 'var(--color-warning)',
                    dark: 'var(--color-warning-dark)',
                },
                error: {
                    light: 'var(--color-error-light)',
                    DEFAULT: 'var(--color-error)',
                    dark: 'var(--color-error-dark)',
                },
                info: {
                    light: 'var(--color-info-light)',
                    DEFAULT: 'var(--color-info)',
                    dark: 'var(--color-info-dark)',
                },

                // Neutrales (base del diseño) - kept as static values
                neutral: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#E5E5E5',
                    300: '#D4D4D4',
                    400: '#A3A3A3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0A0A0A',
                },

                // Dorado/Champagne (acentos premium) - legacy, use 'accent' instead
                gold: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#D4A853',
                    600: '#B8956C',
                },

                // Sage/Oliva (alternativa sofisticada)
                sage: {
                    400: '#9CA38F',
                    500: '#7C8B6F',
                    600: '#5F6B52',
                },

                // Dark mode específicos
                dark: {
                    bg: '#0F0F0F',
                    card: '#1A1A1A',
                    elevated: '#262626',
                    border: '#2E2E2E',
                },
            },

            // =============================================
            // ANIMACIONES SUTILES
            // =============================================
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },

            // =============================================
            // SOMBRAS MINIMALISTAS
            // =============================================
            boxShadow: {
                'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
                'soft': '0 2px 8px -2px rgb(0 0 0 / 0.08)',
                'medium': '0 4px 16px -4px rgb(0 0 0 / 0.1)',
            },

            // =============================================
            // BORDES REDONDEADOS (mínimos para luxury)
            // =============================================
            borderRadius: {
                'none': '0',
                'xs': '2px',
                'sm': '4px',
            },

            // =============================================
            // ESPACIADO ADICIONAL
            // =============================================
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },

            // =============================================
            // TAMAÑOS DE CONTENEDOR
            // =============================================
            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },

            // =============================================
            // LETTER SPACING
            // =============================================
            letterSpacing: {
                'extra-wide': '0.2em',
            },

            // =============================================
            // ASPECT RATIOS
            // =============================================
            aspectRatio: {
                '3/4': '3 / 4',
                '4/3': '4 / 3',
                '21/9': '21 / 9',
            },
        },
    },
    plugins: [],
}
