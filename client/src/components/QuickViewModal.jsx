import { useState, useEffect } from 'react';
import { X, ShoppingCart, Heart, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const { addItem, getProductStock } = useCart();
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
    const { user } = useAuth();

    // Reset state when modal opens with a new product
    useEffect(() => {
        if (isOpen && product) {
            setSelectedSize('');
            setQuantity(1);
        }
    }, [isOpen, product?._id]);

    if (!isOpen || !product) return null;

    // Get available sizes with stock
    const availableSizes = product.sizeStock?.filter(s => s.stock > 0) || [];

    // Get stock for selected size
    const selectedSizeStock = selectedSize
        ? (product.sizeStock?.find(s => s.size === selectedSize)?.stock || 0)
        : 0;

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQuantity(1); // Reset quantity when size changes
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.error('Por favor selecciona una talla');
            return;
        }

        if (quantity > selectedSizeStock) {
            toast.error(`Solo hay ${selectedSizeStock} unidades disponibles`);
            return;
        }

        setLoading(true);
        try {
            // FIXED: Correct argument order is (product, size, quantity)
            await addItem(product, selectedSize, quantity);
            toast.success('Añadido al carrito');
            onClose();
        } catch (error) {
            toast.error('Error al añadir al carrito');
        } finally {
            setLoading(false);
        }
    };

    const handleWishlist = async () => {
        if (!user) {
            toast.error('Inicia sesión para añadir a favoritos');
            return;
        }

        if (isInWishlist(product._id)) {
            await removeFromWishlist(product._id);
            toast.success('Eliminado de favoritos');
        } else {
            await addToWishlist(product._id);
            toast.success('Añadido a favoritos');
        }
    };

    const incrementQuantity = () => {
        if (!selectedSize) {
            toast.error('Selecciona una talla primero');
            return;
        }
        if (quantity < selectedSizeStock) {
            setQuantity(quantity + 1);
        } else {
            toast.error(`Solo hay ${selectedSizeStock} unidades disponibles`);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

                {/* Modal */}
                <div
                    className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div className="relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-96 object-cover rounded-lg"
                                loading="lazy"
                            />
                            {product.discount > 0 && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    -{product.discount}%
                                </span>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {product.name}
                            </h2>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            className={i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    ({product.numReviews || 0} reseñas)
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                {product.discount > 0 ? (
                                    <>
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            €{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                        </span>
                                        <span className="text-xl text-gray-400 line-through">
                                            €{product.price.toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        €{product.price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                                {product.description}
                            </p>

                        </div>

                        {/* Hide Size/Quantity for complex products to avoid confusion */}
                        {!(product.colors?.length > 0 || product.materials?.length > 0) && (
                            <>
                                {/* Size Selection */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Talla {selectedSize && <span className="font-bold">: {selectedSize}</span>}
                                        </label>
                                        {selectedSize && selectedSizeStock > 0 && (
                                            <span className={`text-sm ${selectedSizeStock <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                                                {selectedSizeStock} disponibles
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map((sizeData) => (
                                            <button
                                                key={sizeData.size}
                                                onClick={() => handleSizeSelect(sizeData.size)}
                                                className={`px-4 py-2 border rounded-lg transition-colors ${selectedSize === sizeData.size
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                                                    }`}
                                            >
                                                {sizeData.size}
                                            </button>
                                        ))}
                                    </div>
                                    {availableSizes.length === 0 && (
                                        <p className="text-red-500 text-sm">Sin stock disponible</p>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cantidad
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={decrementQuantity}
                                            disabled={quantity <= 1}
                                            className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center text-lg font-medium dark:text-white">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={incrementQuantity}
                                            disabled={!selectedSize || quantity >= selectedSizeStock}
                                            className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                        {selectedSize && quantity >= selectedSizeStock && (
                                            <span className="text-sm text-blue-600 ml-2">Máx.</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-auto">
                            {(product.colors?.length > 0 || product.materials?.length > 0) ? (
                                <Link
                                    to={`/product/${product.slug || product._id}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                                    onClick={onClose}
                                >
                                    Seleccionar Opciones
                                </Link>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loading || availableSizes.length === 0 || !selectedSize}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                                    Añadir al carrito
                                </button>
                            )}
                            <button
                                onClick={handleWishlist}
                                className={`p-3 border rounded-lg transition-colors ${isInWishlist(product._id)
                                    ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900'
                                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500 dark:border-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <Heart size={20} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        {/* View Full Details Link */}
                        <Link
                            to={`/product/${product.slug || product._id}`}
                            className="mt-4 text-center text-primary hover:text-primary-dark dark:text-primary font-medium"
                        >
                            Ver todos los detalles →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
