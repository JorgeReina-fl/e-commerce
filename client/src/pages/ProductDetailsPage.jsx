import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, Star, Heart, BadgeCheck, ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import useStockUpdates from '../hooks/useStockUpdates';
import Rating from '../components/Rating';
import RelatedProducts from '../components/RelatedProducts';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { user, token } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { isInWishlist, toggleWishlist } = useWishlist();

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Real-time stock updates via WebSocket
    const {
        sizeStock: realtimeSizeStock,
        isUpdating: stockIsUpdating,
        lastUpdate: stockLastUpdate,
        isConnected: isRealtimeConnected
    } = useStockUpdates(product?._id, product?.sizeStock || []);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Set defaults when product loads
    useEffect(() => {
        if (product) {
            if (product.colors?.length > 0 && !selectedColor) {
                setSelectedColor(product.colors[0]);
            }
            if (product.materials?.length > 0 && !selectedMaterial) {
                setSelectedMaterial(product.materials[0]);
            }
        }
    }, [product]);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/products/${id}`);
            setProduct(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error al cargar el producto');
            setLoading(false);
        }
    };

    // Get all images (main + gallery)
    const getAllImages = () => {
        const images = [];
        if (product?.image) {
            images.push({ url: product.image, alt: product.name });
        }
        if (product?.images?.length > 0) {
            images.push(...product.images);
        }
        return images;
    };

    // Get stock for specific color/material/size combination
    // Uses real-time stock data if available
    const getStockForCombination = (color, material, size) => {
        // First check real-time stock data
        const realtimeStock = realtimeSizeStock?.find(s => s.size === size);
        if (realtimeStock !== undefined) {
            return realtimeStock.stock;
        }

        if (!product?.inventory || product.inventory.length === 0) {
            // Fallback to sizeStock
            const sizeStock = product?.sizeStock?.find(s => s.size === size);
            return sizeStock ? sizeStock.stock : 0;
        }
        const inv = product.inventory.find(
            i => i.color === color && i.material === material && i.size === size
        );
        return inv ? inv.stock : 0;
    };

    // Get available sizes for current color/material selection
    const getAvailableSizes = () => {
        if (!product) return [];

        if (product.inventory?.length > 0 && selectedColor && selectedMaterial) {
            const availableSizes = product.inventory
                .filter(i => i.color === selectedColor.name && i.material === selectedMaterial && i.stock > 0)
                .map(i => i.size);
            return [...new Set(availableSizes)];
        }

        // Fallback to sizes or sizeStock
        if (product.sizes?.length > 0) return product.sizes;
        return product.sizeStock?.filter(s => s.stock > 0).map(s => s.size) || [];
    };

    // Get total stock for selected color/material
    const getTotalStockForSelection = () => {
        if (!product?.inventory || !selectedColor || !selectedMaterial) {
            return product?.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;
        }
        return product.inventory
            .filter(i => i.color === selectedColor.name && i.material === selectedMaterial)
            .reduce((sum, i) => sum + i.stock, 0);
    };

    // Calculate selected size stock - handles both variant and non-variant products
    const getSelectedSizeStock = () => {
        if (!selectedSize) return 0;

        // If product has inventory with color/material variants
        if (product?.inventory?.length > 0 && selectedColor && selectedMaterial) {
            return getStockForCombination(selectedColor.name, selectedMaterial, selectedSize);
        }

        // Use real-time stock if available
        const realtimeStock = realtimeSizeStock?.find(s => s.size === selectedSize);
        if (realtimeStock) {
            return realtimeStock.stock;
        }

        // Fallback to product's sizeStock
        const sizeStock = product?.sizeStock?.find(s => s.size === selectedSize);
        return sizeStock?.stock || 0;
    };

    const selectedSizeStock = getSelectedSizeStock();

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Por favor selecciona una talla');
            return;
        }
        if (product.colors?.length > 0 && !selectedColor) {
            toast.error('Por favor selecciona un color');
            return;
        }
        if (product.materials?.length > 0 && !selectedMaterial) {
            toast.error('Por favor selecciona un material');
            return;
        }

        // Add item with variant info
        addItem({
            ...product,
            selectedColor: selectedColor?.name,
            selectedMaterial: selectedMaterial
        }, selectedSize, quantity);

        toast.success(`${quantity} ${quantity === 1 ? 'producto añadido' : 'productos añadidos'} al carrito`);
    };

    // Check if all required selections are made
    const isSelectionComplete =
        (!product?.colors?.length || selectedColor) &&
        (!product?.materials?.length || selectedMaterial) &&
        selectedSize;

    const incrementQuantity = () => {
        if (!isSelectionComplete) {
            toast.error('Por favor selecciona todas las opciones primero');
            return;
        }
        if (quantity < selectedSizeStock) {
            setQuantity(quantity + 1);
        } else {
            toast.error(`Solo hay ${selectedSizeStock} unidades disponibles`);
        }
    };

    const decrementQuantity = () => {
        if (!isSelectionComplete) return;
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const nextImage = () => {
        const images = getAllImages();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        const images = getAllImages();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Debes iniciar sesión para dejar una reseña');
            navigate('/login');
            return;
        }

        setSubmittingReview(true);

        try {
            await axios.post(
                `${API_URL}/products/${id}/reviews`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('¡Reseña añadida correctamente!');
            setRating(5);
            setComment('');
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar la reseña');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-gray-600 mb-4">Producto no encontrado</p>
                <Link to="/" className="text-primary hover:underline">
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    const allImages = getAllImages();
    const availableSizes = getAvailableSizes();
    const totalStockForSelection = getTotalStockForSelection();
    const userHasReviewed = product.reviews?.some(review => review.user === user?._id);
    const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* SEO Meta Tags */}
            <SEO
                title={product.name}
                description={product.description?.substring(0, 160)}
                image={product.image}
                url={`${window.location.origin}/product/${product.slug || product._id}`}
                type="product"
                product={product}
            />

            {/* Back Button */}
            <Link to="/" className="inline-flex items-center text-primary hover:text-blue-700 mb-6">
                <ArrowLeft size={20} className="mr-2" />
                Volver a la tienda
            </Link>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Image Gallery */}
                <div className="relative">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
                        <img
                            src={allImages[currentImageIndex]?.url}
                            alt={allImages[currentImageIndex]?.alt || product.name}
                            className="w-full h-full object-cover"
                        />

                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Discount Badge */}
                        {product.discount > 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{product.discount}%
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                        ? 'border-primary ring-2 ring-blue-200'
                                        : 'border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Wishlist button */}
                    {user && (
                        <button
                            onClick={() => toggleWishlist(product._id)}
                            className="absolute top-4 left-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all z-20"
                        >
                            <Heart
                                size={24}
                                className={isInWishlist(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                            />
                        </button>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                        {product.category}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="mb-4">
                        <Rating value={product.rating} numReviews={product.numReviews} size={20} />
                    </div>

                    {/* Price */}
                    <div className="mb-6" data-testid="product-price">
                        {product.discount > 0 ? (
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-red-600">€{discountedPrice.toFixed(2)}</span>
                                <span className="text-2xl text-gray-400 line-through">€{product.price.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">€{product.price.toFixed(2)}</span>
                        )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Color Selection */}
                    {product.colors?.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color: <span className="text-gray-900 dark:text-white font-semibold">{selectedColor?.name || 'Selecciona'}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((color, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedColor(color);
                                            setSelectedSize(''); // Reset size when color changes
                                            setQuantity(1); // Reset quantity when color changes
                                        }}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.name === color.name
                                            ? 'ring-2 ring-offset-2 ring-primary border-primary'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Material Selection */}
                    {product.materials?.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Material:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.materials.map((material, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedMaterial(material);
                                            setSelectedSize(''); // Reset size when material changes
                                            setQuantity(1); // Reset quantity when material changes
                                        }}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${selectedMaterial === material
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 hover:border-primary'
                                            }`}
                                    >
                                        {material}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Talla: <span className="text-gray-900 dark:text-white font-semibold">{selectedSize || 'Selecciona'}</span>
                            </label>
                            {selectedSize && !product?.inventory?.length && (
                                <span className={`text-sm ${selectedSizeStock > 5 ? 'text-green-600' : selectedSizeStock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                                    {selectedSizeStock > 0 ? `${selectedSizeStock} disponibles` : 'Sin stock'}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(product.sizes || product.sizeStock?.map(s => s.size) || []).map((size) => {
                                const stock = selectedColor && selectedMaterial
                                    ? getStockForCombination(selectedColor.name, selectedMaterial, size)
                                    : product.sizeStock?.find(s => s.size === size)?.stock || 0;
                                const isAvailable = stock > 0;

                                return (
                                    <button
                                        key={size}
                                        data-testid={`size-${size}`}
                                        onClick={() => {
                                            if (isAvailable) {
                                                setSelectedSize(size);
                                                setQuantity(1); // Reset quantity when size changes
                                            }
                                        }}
                                        disabled={!isAvailable}
                                        className={`min-w-[3rem] px-4 py-2 text-sm font-medium rounded-lg transition-all ${selectedSize === size
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                            : isAvailable
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed line-through'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity and Add to Cart */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                                onClick={decrementQuantity}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isSelectionComplete || quantity <= 1}
                            >
                                <Minus size={18} />
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                onClick={incrementQuantity}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isSelectionComplete || quantity >= selectedSizeStock}
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!isSelectionComplete || selectedSizeStock === 0}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${!isSelectionComplete || selectedSizeStock === 0
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-hover text-white'
                                }`}
                        >
                            <ShoppingCart size={20} />
                            Añadir al carrito
                        </button>
                    </div>

                    {/* Stock Info with Real-time Indicator */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className={`transition-all duration-300 ${stockIsUpdating ? 'animate-pulse bg-green-100 dark:bg-green-900 px-2 py-1 rounded' : ''}`}>
                                {totalStockForSelection > 0 ? (
                                    <p className={stockIsUpdating ? 'text-green-600 font-medium' : ''}>
                                        ✓ {totalStockForSelection} unidades disponibles para esta selección
                                    </p>
                                ) : (
                                    <p className="text-red-500">✗ Sin stock disponible</p>
                                )}
                            </div>
                            {/* Real-time connection indicator */}
                            <div className="flex items-center gap-1" title={isRealtimeConnected ? 'Actualización en tiempo real activa' : 'Sin conexión en tiempo real'}>
                                {isRealtimeConnected ? (
                                    <Wifi size={14} className="text-green-500" />
                                ) : (
                                    <WifiOff size={14} className="text-gray-400" />
                                )}
                                <span className="text-xs hidden sm:inline">
                                    {isRealtimeConnected ? 'En vivo' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <ShareButtons product={product} />
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Opiniones de clientes ({product.numReviews})
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Review List */}
                    <div className="space-y-6">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center">
                                                <span className="text-primary dark:text-primary font-medium">
                                                    {review.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {review.name}
                                                    <BadgeCheck size={16} className="text-primary" />
                                                </p>
                                                <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Aún no hay opiniones. ¡Sé el primero en opinar!</p>
                        )}
                    </div>

                    {/* Review Form */}
                    {user && !userHasReviewed && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-fit">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Deja tu opinión
                            </h3>
                            <form onSubmit={handleSubmitReview}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tu valoración
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={24}
                                                    className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tu comentario
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Cuéntanos tu experiencia con este producto..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:bg-gray-400"
                                >
                                    {submittingReview ? 'Enviando...' : 'Enviar opinión'}
                                </button>
                            </form>
                        </div>
                    )}

                    {user && userHasReviewed && (
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 text-center">
                            <BadgeCheck size={48} className="mx-auto text-green-500 mb-2" />
                            <p className="text-green-700 dark:text-green-400 font-medium">Ya has dejado tu opinión sobre este producto</p>
                        </div>
                    )}

                    {!user && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Inicia sesión para dejar tu opinión</p>
                            <Link to="/login" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
                                Iniciar Sesión
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            <RelatedProducts productId={id} category={product.category} tags={product.tags} />
        </div>
    );
};

export default ProductDetailsPage;


