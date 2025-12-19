import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Loader2, ArrowLeft, User, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const SharedWishlistPage = () => {
    const { token } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState({});

    const { addToWishlist, isInWishlist } = useWishlist();
    const { addItem } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetchSharedWishlist = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${API_URL}/wishlist/shared/${token}`
                );
                setWishlist(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Lista no encontrada');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedWishlist();
    }, [token]);

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [productId]: size
        }));
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

    const handleAddToMyWishlist = async (productId) => {
        if (!user) {
            toast.error('Inicia sesión para guardar favoritos');
            return;
        }
        await addToWishlist(productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {error}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Esta lista no existe o ya no es pública.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary mb-6"
            >
                <ArrowLeft size={20} />
                Volver al Inicio
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="text-red-500" size={32} fill="currentColor" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {wishlist.name}
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User size={18} />
                    <span>Lista de {wishlist.ownerName}</span>
                    <span className="mx-2">•</span>
                    <span>{wishlist.itemCount} productos</span>
                </div>
            </div>

            {/* Products Grid */}
            {wishlist.items.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">Esta lista está vacía</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.items.map((item) => {
                        const hasStock = item.product?.sizeStock?.some(s => s.stock > 0);
                        const alreadyInWishlist = isInWishlist(item.product._id);

                        return (
                            <div
                                key={item.product._id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <Link to={`/product/${item.product._id}`} className="block relative">
                                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className={`w-full h-64 object-cover ${!hasStock ? 'opacity-50' : ''}`}
                                        />
                                    </div>
                                    {!hasStock && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                Agotado
                                            </span>
                                        </div>
                                    )}
                                </Link>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Link to={`/product/${item.product._id}`}>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary">
                                                {item.product.name}
                                            </h3>
                                        </Link>
                                        <button
                                            onClick={() => handleAddToMyWishlist(item.product._id)}
                                            disabled={alreadyInWishlist}
                                            className={`transition-colors ${alreadyInWishlist
                                                ? 'text-red-500 cursor-default'
                                                : 'text-gray-400 hover:text-red-500'
                                                }`}
                                            title={alreadyInWishlist ? 'Ya está en tu lista' : 'Añadir a mi lista'}
                                        >
                                            <Heart size={20} fill={alreadyInWishlist ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.product.category}</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        €{item.product.price?.toFixed(2)}
                                    </p>

                                    {hasStock && (
                                        <>
                                            {/* Size selector */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Talla:
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.product.sizeStock?.map((sizeObj) => {
                                                        const isSelected = selectedSizes[item.product._id] === sizeObj.size;
                                                        const sizeHasStock = sizeObj.stock > 0;

                                                        return (
                                                            <button
                                                                key={sizeObj.size}
                                                                onClick={() => handleSizeSelect(item.product._id, sizeObj.size)}
                                                                disabled={!sizeHasStock}
                                                                className={`px-3 py-1 border rounded text-sm ${isSelected
                                                                    ? 'bg-primary text-white border-primary'
                                                                    : sizeHasStock
                                                                        ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary'
                                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {sizeObj.size}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(item.product)}
                                                disabled={!selectedSizes[item.product._id]}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                                            >
                                                <ShoppingCart size={20} />
                                                Añadir al Carrito
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SharedWishlistPage;


