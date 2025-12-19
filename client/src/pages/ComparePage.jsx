import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ArrowLeft, ShoppingCart, Scale } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { ProductBadges } from '../components/ProductBadge';
import Rating from '../components/Rating';
import toast from 'react-hot-toast';

const ComparePage = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addItem } = useCart();
    const [selectedSizes, setSelectedSizes] = useState({});

    const handleSizeChange = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    const handleAddToCart = (product) => {
        const size = selectedSizes[product._id];
        if (!size) {
            toast.error('Selecciona una talla');
            return;
        }
        addItem(product, size, 1);
        toast.success('Añadido al carrito');
    };

    if (compareItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <Scale size={64} className="mx-auto text-gray-300 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Comparador de Productos
                    </h1>
                    <p className="text-gray-600 mb-8">
                        No tienes productos para comparar. Añade hasta 4 productos para ver sus características lado a lado.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Explorar Productos
                    </Link>
                </div>
            </div>
        );
    }

    // Get all unique attribute keys
    const totalStockFor = (product) => {
        return product.sizeStock?.reduce((acc, s) => acc + s.stock, 0) || 0;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-primary hover:text-blue-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Comparar Productos ({compareItems.length})
                    </h1>
                </div>
                <button
                    onClick={clearCompare}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                    Limpiar todo
                </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="w-40 p-4 text-left text-sm font-medium text-gray-500 bg-gray-50 sticky left-0 z-10">
                                Característica
                            </th>
                            {compareItems.map(product => (
                                <th key={product._id} className="min-w-[250px] p-4 text-left border-l border-gray-200">
                                    <div className="relative">
                                        <button
                                            onClick={() => removeFromCompare(product._id)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Product Image */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Imagen
                            </td>
                            {compareItems.map(product => (
                                <td key={product._id} className="p-4 border-l border-gray-200">
                                    <Link to={`/product/${product._id}`}>
                                        <div className="relative">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                            />
                                            {product.badges && product.badges.length > 0 && (
                                                <div className="absolute top-2 right-2">
                                                    <ProductBadges badges={product.badges} size="xs" maxVisible={1} />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </td>
                            ))}
                        </tr>

                        {/* Product Name */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Nombre
                            </td>
                            {compareItems.map(product => (
                                <td key={product._id} className="p-4 border-l border-gray-200">
                                    <Link
                                        to={`/product/${product._id}`}
                                        className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                                    >
                                        {product.name}
                                    </Link>
                                </td>
                            ))}
                        </tr>

                        {/* Price */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Precio
                            </td>
                            {compareItems.map(product => (
                                <td key={product._id} className="p-4 border-l border-gray-200">
                                    <span className="text-2xl font-bold text-gray-900">
                                        €{product.price.toFixed(2)}
                                    </span>
                                </td>
                            ))}
                        </tr>

                        {/* Category */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Categoría
                            </td>
                            {compareItems.map(product => (
                                <td key={product._id} className="p-4 border-l border-gray-200">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {product.category}
                                    </span>
                                </td>
                            ))}
                        </tr>

                        {/* Rating */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Valoración
                            </td>
                            {compareItems.map(product => (
                                <td key={product._id} className="p-4 border-l border-gray-200">
                                    <Rating value={product.rating} numReviews={product.numReviews} size={16} />
                                </td>
                            ))}
                        </tr>

                        {/* Stock */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Stock Total
                            </td>
                            {compareItems.map(product => {
                                const stock = totalStockFor(product);
                                return (
                                    <td key={product._id} className="p-4 border-l border-gray-200">
                                        <span className={`font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {stock > 0 ? `${stock} unidades` : 'Agotado'}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Sizes */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Tallas
                            </td>
                            {compareItems.map(product => (
                                <td key={product._id} className="p-4 border-l border-gray-200">
                                    <div className="flex flex-wrap gap-1">
                                        {product.sizeStock?.map((s, i) => (
                                            <span
                                                key={i}
                                                className={`px-2 py-1 text-xs rounded ${s.stock > 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-400 line-through'
                                                    }`}
                                            >
                                                {s.size}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            ))}
                        </tr>

                        {/* Colors (if variants exist) */}
                        <tr className="border-t border-gray-200">
                            <td className="p-4 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                                Colores
                            </td>
                            {compareItems.map(product => {
                                const colors = product.variants?.filter(v => v.type === 'color') || [];
                                return (
                                    <td key={product._id} className="p-4 border-l border-gray-200">
                                        {colors.length > 0 ? (
                                            <div className="flex gap-2">
                                                {colors.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-6 h-6 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: c.value }}
                                                        title={c.name}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Add to Cart */}
                        <tr className="border-t border-gray-200 bg-gray-50">
                            <td className="p-4 text-sm font-medium text-gray-900 sticky left-0">
                                Acción
                            </td>
                            {compareItems.map(product => {
                                const stock = totalStockFor(product);
                                const availableSizes = product.sizeStock?.filter(s => s.stock > 0) || [];
                                return (
                                    <td key={product._id} className="p-4 border-l border-gray-200">
                                        {stock > 0 ? (
                                            <div className="space-y-3">
                                                <select
                                                    value={selectedSizes[product._id] || ''}
                                                    onChange={(e) => handleSizeChange(product._id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    <option value="">Seleccionar talla</option>
                                                    {availableSizes.map((s, i) => (
                                                        <option key={i} value={s.size}>{s.size}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
                                                >
                                                    <ShoppingCart size={18} />
                                                    Añadir
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No disponible</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePage;


