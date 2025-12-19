// Shipping zones configuration with rates and delivery times
export const SHIPPING_ZONES = {
    ES: {
        name: 'España',
        code: 'ES',
        zone: 'domestic',
        methods: [
            { id: 'standard', name: 'Estándar', price: 4.99, days: '3-5', freeFrom: 50 },
            { id: 'express', name: 'Express', price: 9.99, days: '1-2', freeFrom: null }
        ]
    },
    PT: {
        name: 'Portugal',
        code: 'PT',
        zone: 'europe',
        methods: [
            { id: 'standard', name: 'Estándar', price: 7.99, days: '4-6', freeFrom: 80 },
            { id: 'express', name: 'Express', price: 14.99, days: '2-3', freeFrom: null }
        ]
    },
    FR: {
        name: 'Francia',
        code: 'FR',
        zone: 'europe',
        methods: [
            { id: 'standard', name: 'Estándar', price: 7.99, days: '4-6', freeFrom: 80 },
            { id: 'express', name: 'Express', price: 14.99, days: '2-3', freeFrom: null }
        ]
    },
    DE: {
        name: 'Alemania',
        code: 'DE',
        zone: 'europe',
        methods: [
            { id: 'standard', name: 'Estándar', price: 8.99, days: '4-7', freeFrom: 100 },
            { id: 'express', name: 'Express', price: 16.99, days: '2-3', freeFrom: null }
        ]
    },
    IT: {
        name: 'Italia',
        code: 'IT',
        zone: 'europe',
        methods: [
            { id: 'standard', name: 'Estándar', price: 8.99, days: '4-7', freeFrom: 100 },
            { id: 'express', name: 'Express', price: 16.99, days: '2-3', freeFrom: null }
        ]
    },
    GB: {
        name: 'Reino Unido',
        code: 'GB',
        zone: 'europe',
        methods: [
            { id: 'standard', name: 'Estándar', price: 9.99, days: '5-8', freeFrom: 100 },
            { id: 'express', name: 'Express', price: 19.99, days: '3-4', freeFrom: null }
        ]
    },
    US: {
        name: 'Estados Unidos',
        code: 'US',
        zone: 'international',
        methods: [
            { id: 'standard', name: 'Estándar', price: 19.99, days: '10-15', freeFrom: 150 },
            { id: 'express', name: 'Express', price: 39.99, days: '5-7', freeFrom: null }
        ]
    },
    MX: {
        name: 'México',
        code: 'MX',
        zone: 'international',
        methods: [
            { id: 'standard', name: 'Estándar', price: 24.99, days: '12-18', freeFrom: 150 },
            { id: 'express', name: 'Express', price: 49.99, days: '6-8', freeFrom: null }
        ]
    },
    OTHER: {
        name: 'Otros países',
        code: 'OTHER',
        zone: 'international',
        methods: [
            { id: 'standard', name: 'Estándar', price: 29.99, days: '15-25', freeFrom: 200 }
        ]
    }
};

// Get all countries for dropdown
export const getCountries = () => {
    return Object.entries(SHIPPING_ZONES)
        .filter(([code]) => code !== 'OTHER')
        .map(([code, data]) => ({
            code,
            name: data.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};

// Get shipping options for a country
export const getShippingOptions = (countryCode, cartTotal) => {
    const zone = SHIPPING_ZONES[countryCode] || SHIPPING_ZONES.OTHER;

    return zone.methods.map(method => {
        const isFree = method.freeFrom && cartTotal >= method.freeFrom;
        return {
            ...method,
            finalPrice: isFree ? 0 : method.price,
            isFree,
            freeFromAmount: method.freeFrom
        };
    });
};

// Calculate shipping cost
export const calculateShipping = (countryCode, methodId, cartTotal) => {
    const options = getShippingOptions(countryCode, cartTotal);
    const selected = options.find(opt => opt.id === methodId);
    return selected ? selected.finalPrice : options[0]?.finalPrice || 0;
};

// Get zone info
export const getZoneInfo = (countryCode) => {
    return SHIPPING_ZONES[countryCode] || SHIPPING_ZONES.OTHER;
};
