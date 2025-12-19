import { createContext, useContext, useState, useEffect } from 'react';

const EXCHANGE_RATES = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.86
};

const CURRENCY_CONFIG = {
    EUR: { symbol: '€', code: 'EUR', name: 'Euro', position: 'after' },
    USD: { symbol: '$', code: 'USD', name: 'US Dollar', position: 'before' },
    GBP: { symbol: '£', code: 'GBP', name: 'British Pound', position: 'before' }
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('currency') || 'EUR';
    });
    const [rates, setRates] = useState(EXCHANGE_RATES);

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    // Convert price from EUR (base) to selected currency
    const convertPrice = (priceInEur) => {
        if (!priceInEur || isNaN(priceInEur)) return 0;
        return priceInEur * rates[currency];
    };

    // Format price with currency symbol
    const formatPrice = (priceInEur) => {
        const converted = convertPrice(priceInEur);
        const config = CURRENCY_CONFIG[currency];
        const formatted = converted.toFixed(2);

        if (config.position === 'before') {
            return `${config.symbol}${formatted}`;
        }
        return `${formatted}${config.symbol}`;
    };

    // Get just the symbol
    const getCurrencySymbol = () => {
        return CURRENCY_CONFIG[currency].symbol;
    };

    // Available currencies
    const currencies = Object.keys(CURRENCY_CONFIG).map(code => ({
        code,
        ...CURRENCY_CONFIG[code]
    }));

    const value = {
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
        currencies,
        rates
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export default CurrencyContext;


