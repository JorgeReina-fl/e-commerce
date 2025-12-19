import { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';

const sortOptions = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'rating', label: 'Mejor valorados' },
    { value: 'popular', label: 'Más populares' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
    { value: 'name-desc', label: 'Nombre: Z-A' }
];

const ProductSort = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
            >
                <ArrowUpDown size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{selectedOption.label}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                            >
                                <span className={`${value === option.value ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <Check size={16} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductSort;


