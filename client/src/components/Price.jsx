import { useCurrency } from '../context/CurrencyContext';

/**
 * Price component that displays prices in the selected currency
 * Usage: <Price amount={29.99} /> or <Price amount={29.99} originalAmount={39.99} />
 */
const Price = ({ amount, originalAmount, className = '', showSymbol = true, size = 'base' }) => {
    const { formatPrice, convertPrice, getCurrencySymbol } = useCurrency();

    if (amount === null || amount === undefined) return null;

    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
    };

    // If there's an original price (discount), show both
    if (originalAmount && originalAmount > amount) {
        const discountPercent = Math.round((1 - amount / originalAmount) * 100);

        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className={`font-bold text-red-600 ${sizeClasses[size]}`}>
                    {formatPrice(amount)}
                </span>
                <span className={`text-gray-400 line-through ${sizeClasses[size === 'base' ? 'sm' : 'xs']}`}>
                    {formatPrice(originalAmount)}
                </span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                    -{discountPercent}%
                </span>
            </div>
        );
    }

    // Simple price display
    return (
        <span className={`font-bold text-gray-900 dark:text-white ${sizeClasses[size]} ${className}`}>
            {formatPrice(amount)}
        </span>
    );
};

export default Price;


