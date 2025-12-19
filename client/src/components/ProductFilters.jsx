import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const ProductFilters = ({
    filters,
    onFilterChange,
    onClear,
    availableBrands = [],
    availableColors = [],
    availableSizes = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        size: true,
        color: false,
        brand: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handlePriceChange = (type, value) => {
        onFilterChange({
            ...filters,
            [type]: value
        });
    };

    const handleSizeToggle = (size) => {
        const currentSizes = filters.sizes || [];
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter(s => s !== size)
            : [...currentSizes, size];
        onFilterChange({ ...filters, sizes: newSizes });
    };

    const handleColorToggle = (color) => {
        const currentColors = filters.colors || [];
        const newColors = currentColors.includes(color)
            ? currentColors.filter(c => c !== color)
            : [...currentColors, color];
        onFilterChange({ ...filters, colors: newColors });
    };

    const handleBrandToggle = (brand) => {
        const currentBrands = filters.brands || [];
        const newBrands = currentBrands.includes(brand)
            ? currentBrands.filter(b => b !== brand)
            : [...currentBrands, brand];
        onFilterChange({ ...filters, brands: newBrands });
    };

    const hasActiveFilters = filters.minPrice || filters.maxPrice ||
        (filters.sizes?.length > 0) || (filters.colors?.length > 0) || (filters.brands?.length > 0);

    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    const defaultColors = [
        { name: 'Negro', value: '#000000' },
        { name: 'Blanco', value: '#FFFFFF' },
        { name: 'Azul', value: '#3B82F6' },
        { name: 'Rojo', value: '#EF4444' },
        { name: 'Verde', value: '#10B981' },
        { name: 'Gris', value: '#6B7280' },
        { name: 'Marrón', value: '#92400E' },
        { name: 'Rosa', value: '#EC4899' }
    ];

    const sizes = availableSizes.length > 0 ? availableSizes : defaultSizes;
    const colors = availableColors.length > 0 ? availableColors : defaultColors;

    return (
        <>
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
                <Filter size={18} />
                Filtros
                {hasActiveFilters && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                )}
            </button>

            {/* Desktop Filters Sidebar */}
            <div className={`
                ${isOpen ? 'fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent' : 'hidden lg:block'}
            `}>
                <div className={`
                    ${isOpen ? 'absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto' : ''}
                    lg:static lg:w-full lg:shadow-none
                `}>
                    {/* Mobile Header */}
                    {isOpen && (
                        <div className="lg:hidden flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold dark:text-white">Filtros</h3>
                            <button onClick={() => setIsOpen(false)}>
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                    )}

                    <div className="p-4 space-y-4">
                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={onClear}
                                className="w-full text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                            >
                                Limpiar filtros
                            </button>
                        )}

                        {/* Price Range */}
                        <div className="border-b dark:border-gray-700 pb-4">
                            <button
                                onClick={() => toggleSection('price')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">Precio</span>
                                {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {expandedSections.price && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Mín"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                        />
                                        <span className="text-gray-500 self-center">-</span>
                                        <input
                                            type="number"
                                            placeholder="Máx"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Size Filter */}
                        <div className="border-b dark:border-gray-700 pb-4">
                            <button
                                onClick={() => toggleSection('size')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">Talla</span>
                                {expandedSections.size ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {expandedSections.size && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${(filters.sizes || []).includes(size)
                                                ? 'border-primary bg-primary-light/50 text-primary dark:bg-primary-dark dark:text-primary-light'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Color Filter */}
                        <div className="border-b dark:border-gray-700 pb-4">
                            <button
                                onClick={() => toggleSection('color')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">Color</span>
                                {expandedSections.color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {expandedSections.color && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => handleColorToggle(color.name)}
                                            className={`flex items-center gap-2 px-3 py-1 text-sm border rounded-lg transition-colors ${(filters.colors || []).includes(color.name)
                                                ? 'border-primary bg-primary-light/50 dark:bg-primary-dark'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <span
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: color.value }}
                                            />
                                            <span className="dark:text-white">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Brand Filter */}
                        {availableBrands.length > 0 && (
                            <div className="pb-4">
                                <button
                                    onClick={() => toggleSection('brand')}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white">Marca</span>
                                    {expandedSections.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {expandedSections.brand && (
                                    <div className="mt-3 space-y-2">
                                        {availableBrands.map((brand) => (
                                            <label key={brand} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={(filters.brands || []).includes(brand)}
                                                    onChange={() => handleBrandToggle(brand)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Apply Button */}
                    {isOpen && (
                        <div className="lg:hidden p-4 border-t dark:border-gray-700">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover"
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductFilters;


