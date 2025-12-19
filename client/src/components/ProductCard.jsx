import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Heart, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { ProductBadges } from './ProductBadge';
import Rating from './Rating';
import LazyImage from './LazyImage';
import toast from 'react-hot-toast';

const ProductCard = ({ product, viewMode = 'grid', onQuickView }) => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { user } = useAuth();

    const inWishlist = isInWishlist(product._id);

    const getStockForSize = (size) => {
        const sizeStock = product.sizeStock?.find(s => s.size === size);
        return sizeStock ? sizeStock.stock : 0;
    };

    const getTotalStock = () => {
        return product.sizeStock?.reduce((total, item) => total + item.stock, 0) || 0;
    };

    const selectedSizeStock = selectedSize ? getStockForSize(selectedSize) : 0;
    const totalStock = getTotalStock();

    const finalPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error(t('product.selectSize'));
            return;
        }
        addItem(product, selectedSize, quantity);
        toast.success(t('cart.addedToCart', 'Añadido al carrito'));
        setSelectedSize('');
        setQuantity(1);
    };

    const incrementQuantity = () => {
        if (quantity < selectedSizeStock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // List View Layout
    if (viewMode === 'list') {
        return (
            <div className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 overflow-hidden transition-all duration-300 flex">
                {/* Product Image */}
                <Link to={`/product/${product.slug || product._id}`} className="w-40 sm:w-48 flex-shrink-0">
                    <div className="relative h-full min-h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-error-600 text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1">
                                -{product.discount}%
                            </span>
                        )}
                        {totalStock === 0 && (
                            <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center">
                                <span className="text-white text-xs font-medium uppercase tracking-wider">{t('product.outOfStock')}</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                                    {product.category}
                                </p>
                                <Link to={`/product/${product.slug || product._id}`}>
                                    <h3 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-white hover:underline underline-offset-4 transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                </Link>
                            </div>
                            <div className="text-right flex-shrink-0" data-testid="product-price">
                                {product.discount > 0 ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-semibold text-neutral-900 dark:text-white tabular-nums">
                                            {formatPrice(finalPrice)}
                                        </span>
                                        <span className="text-sm text-neutral-400 line-through tabular-nums">
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-lg font-semibold text-neutral-900 dark:text-white tabular-nums">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-2">
                            <Rating value={product.rating} numReviews={product.numReviews} size={13} />
                        </div>

                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                            {product.description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => onQuickView && onQuickView()}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-black dark:hover:bg-neutral-100 transition-colors"
                        >
                            <Eye size={16} strokeWidth={1.5} />
                            {t('product.quickView')}
                        </button>
                        {user && (
                            <button
                                onClick={() => toggleWishlist(product._id)}
                                className={`p-2.5 border transition-colors ${inWishlist
                                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                                    : 'border-neutral-300 dark:border-neutral-600 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 dark:hover:border-white dark:hover:text-white'
                                    }`}
                            >
                                <Heart size={18} strokeWidth={1.5} fill={inWishlist ? 'currentColor' : 'none'} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="product-card" className="group bg-white dark:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-300">
            {/* Product Image */}
            <Link to={`/product/${product.slug || product._id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer">
                    <LazyImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Sale Badge */}
                    {product.discount > 0 && (
                        <span className="absolute top-2 left-2 bg-error-600 text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1 z-10">
                            -{product.discount}%
                        </span>
                    )}

                    {/* Low Stock Badge */}
                    {totalStock < 10 && totalStock > 0 && (
                        <span className="absolute top-2 right-2 bg-gold-500 text-neutral-900 text-[10px] font-medium uppercase tracking-wider px-2 py-1">
                            {t('product.lowStock', 'Low Stock')}
                        </span>
                    )}

                    {/* Product Badges */}
                    {product.badges && product.badges.length > 0 && (
                        <div className="absolute top-10 right-2 z-10">
                            <ProductBadges badges={product.badges} size="xs" maxVisible={2} />
                        </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {totalStock === 0 && (
                        <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center">
                            <span className="text-white text-xs font-medium uppercase tracking-wider">
                                {t('product.soldOut', 'Sold Out')}
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    {user && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(product._id);
                            }}
                            className={`absolute top-2 ${product.discount > 0 ? 'right-2' : 'right-2'} p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-900 transition-all z-10 ${inWishlist ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
                                }`}
                            style={{ left: product.discount > 0 ? 'auto' : undefined }}
                        >
                            <Heart
                                size={18}
                                strokeWidth={1.5}
                                fill={inWishlist ? 'currentColor' : 'none'}
                            />
                        </button>
                    )}

                    {/* Quick View Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onQuickView && onQuickView();
                        }}
                        className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 py-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm text-neutral-900 dark:text-white text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                    >
                        <Eye size={14} strokeWidth={1.5} />
                        {t('product.quickView', 'Quick View')}
                    </button>
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-3 sm:p-4">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                    {product.category}
                </p>
                <Link to={`/product/${product.slug || product._id}`}>
                    <h3 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white mb-1.5 line-clamp-1 group-hover:underline underline-offset-4 cursor-pointer">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="mb-2">
                    <Rating value={product.rating} numReviews={product.numReviews} size={13} />
                </div>

                {/* Colors */}
                {product.colors?.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        {product.colors.slice(0, 4).map((color, index) => (
                            <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-neutral-200 dark:border-neutral-700"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-[10px] text-neutral-400 ml-0.5">
                                +{product.colors.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    {product.discount > 0 ? (
                        <>
                            <span className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tabular-nums">
                                {formatPrice(finalPrice)}
                            </span>
                            <span className="text-sm text-neutral-400 line-through tabular-nums">
                                {formatPrice(product.price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tabular-nums">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>

                {/* Size Selection */}
                <div className="mb-3">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">
                        {t('product.selectSize', 'Select Size')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {product.sizeStock?.map((sizeItem, index) => {
                            const isOutOfStock = sizeItem.stock === 0;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!isOutOfStock) {
                                            setSelectedSize(sizeItem.size);
                                            setQuantity(1);
                                        }
                                    }}
                                    disabled={isOutOfStock}
                                    className={`min-w-[32px] px-2 py-1 text-xs font-medium border transition-all ${selectedSize === sizeItem.size
                                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                                        : isOutOfStock
                                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 border-neutral-200 dark:border-neutral-700 cursor-not-allowed line-through'
                                            : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-white'
                                        }`}
                                    title={isOutOfStock ? t('product.outOfStock') : `${sizeItem.stock} ${t('product.available')}`}
                                >
                                    {sizeItem.size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quantity Control */}
                {selectedSize && selectedSizeStock > 0 && (
                    <div className="mb-3">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">
                            {t('product.quantity', 'Quantity')}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus size={14} className="text-neutral-700 dark:text-neutral-300" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-neutral-900 dark:text-white tabular-nums">
                                {quantity}
                            </span>
                            <button
                                onClick={incrementQuantity}
                                disabled={quantity >= selectedSizeStock}
                                className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus size={14} className="text-neutral-700 dark:text-neutral-300" />
                            </button>
                            <span className="text-[10px] text-neutral-400 ml-2">
                                {selectedSizeStock} {t('product.inStock', 'in stock')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={totalStock === 0 || !selectedSize || selectedSizeStock === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium uppercase tracking-wider hover:bg-black dark:hover:bg-neutral-100 transition-colors disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    {t('product.addToCart')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;


