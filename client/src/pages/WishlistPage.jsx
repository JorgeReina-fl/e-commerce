import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import {
    Heart, ShoppingCart, Trash2, Loader2, Plus, Share2, Copy,
    Check, Edit2, X, MoreVertical, Bell, BellOff, ShoppingBag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const {
        wishlists,
        activeWishlist,
        activeWishlistId,
        setActiveWishlistId,
        loading,
        removeFromWishlist,
        clearWishlist,
        createWishlist,
        renameWishlist,
        deleteWishlist,
        shareWishlist,
        unshareWishlist,
        getItemsForCart,
        subscribeToStockAlert,
        checkStockAlert
    } = useWishlist();
    const { addItem } = useCart();

    const [selectedSizes, setSelectedSizes] = useState({});
    const [showNewListModal, setShowNewListModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [editingList, setEditingList] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showMoveToCartModal, setShowMoveToCartModal] = useState(false);
    const [cartItems, setCartItems] = useState(null);
    const [stockAlerts, setStockAlerts] = useState({});

    const items = (activeWishlist?.items || []).filter(item => item && item.product);

    // Check stock alerts for out-of-stock items
    useEffect(() => {
        const checkAlerts = async () => {
            const alerts = {};
            for (const item of items) {
                const hasStock = item.product?.sizeStock?.some(s => s.stock > 0);
                if (!hasStock) {
                    const hasAlert = await checkStockAlert(item.product._id);
                    alerts[item.product._id] = hasAlert;
                }
            }
            setStockAlerts(alerts);
        };
        if (items.length > 0) {
            checkAlerts();
        }
    }, [items]);

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

    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        await createWishlist(newListName.trim());
        setNewListName('');
        setShowNewListModal(false);
    };

    const handleRenameList = async () => {
        if (!editingName.trim() || !editingList) return;
        await renameWishlist(editingList, editingName.trim());
        setEditingList(null);
        setEditingName('');
    };

    const handleShare = async (wishlistId) => {
        const url = await shareWishlist(wishlistId);
        if (url) {
            setShareUrl(url);
            setShowShareModal(true);
        }
    };

    const copyShareUrl = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado');
    };

    const handleMoveAllToCart = async () => {
        const result = await getItemsForCart(activeWishlistId);
        if (result) {
            setCartItems(result);
            setShowMoveToCartModal(true);
        }
    };

    const confirmMoveToCart = () => {
        if (!cartItems) return;

        let addedCount = 0;
        for (const item of cartItems.items) {
            if (item.hasStock) {
                // Use preferred size or first available
                const size = item.preferredSize && item.availableSizes.find(s => s.size === item.preferredSize)
                    ? item.preferredSize
                    : item.availableSizes[0]?.size;

                if (size) {
                    addItem(item.product, size, 1);
                    addedCount++;
                }
            }
        }

        if (addedCount > 0) {
            toast.success(`${addedCount} producto(s) añadido(s) al carrito`);
        }
        setShowMoveToCartModal(false);
        setCartItems(null);
    };

    const handleStockAlert = async (productId) => {
        const success = await subscribeToStockAlert(productId);
        if (success) {
            setStockAlerts(prev => ({ ...prev, [productId]: true }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (wishlists.length === 0 || (wishlists.length === 1 && items.length === 0)) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Tu lista de favoritos está vacía
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    ¡Empieza a añadir productos que te gusten!
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Explorar Productos
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Mis Favoritos
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowNewListModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        <Plus size={18} />
                        Nueva Lista
                    </button>
                </div>
            </div>

            {/* Wishlist Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b dark:border-gray-700">
                {wishlists.map((wishlist) => (
                    <div
                        key={wishlist._id}
                        className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeWishlistId === wishlist._id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => setActiveWishlistId(wishlist._id)}
                    >
                        {editingList === wishlist._id ? (
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24"
                                    autoFocus
                                    onKeyPress={(e) => e.key === 'Enter' && handleRenameList()}
                                />
                                <button onClick={handleRenameList} className="text-green-500">
                                    <Check size={16} />
                                </button>
                                <button onClick={() => setEditingList(null)} className="text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="font-medium">{wishlist.name}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeWishlistId === wishlist._id
                                    ? 'bg-primary-light/500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                    {wishlist.items?.length || 0}
                                </span>
                                {wishlist.isPublic && (
                                    <Share2 size={14} className="text-green-400" />
                                )}
                                {/* Actions dropdown */}
                                <div className="hidden group-hover:flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => {
                                            setEditingList(wishlist._id);
                                            setEditingName(wishlist.name);
                                        }}
                                        className="p-1 hover:bg-white/20 rounded"
                                        title="Renombrar"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleShare(wishlist._id)}
                                        className="p-1 hover:bg-white/20 rounded"
                                        title="Compartir"
                                    >
                                        <Share2 size={14} />
                                    </button>
                                    {wishlists.length > 1 && (
                                        <button
                                            onClick={() => deleteWishlist(wishlist._id)}
                                            className="p-1 hover:bg-red-500/50 rounded text-red-400"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions Bar */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={handleMoveAllToCart}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <ShoppingBag size={18} />
                        Añadir todo al carrito
                    </button>
                    <button
                        onClick={() => handleShare(activeWishlistId)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Share2 size={18} />
                        Compartir Lista
                    </button>
                    <button
                        onClick={() => clearWishlist(activeWishlistId)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                        <Trash2 size={18} />
                        Limpiar lista
                    </button>
                </div>
            )}

            {/* Products Grid */}
            {items.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">Esta lista está vacía</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const hasStock = item.product?.sizeStock?.some(s => s.stock > 0);

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
                                            onClick={() => removeFromWishlist(item.product._id, activeWishlistId)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Heart size={20} fill="currentColor" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.product.category}</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        €{item.product.price?.toFixed(2)}
                                    </p>

                                    {hasStock ? (
                                        <>
                                            {/* Size selector */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Selecciona talla:
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
                                    ) : (
                                        <button
                                            onClick={() => handleStockAlert(item.product._id)}
                                            disabled={stockAlerts[item.product._id]}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${stockAlerts[item.product._id]
                                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-default'
                                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                }`}
                                        >
                                            {stockAlerts[item.product._id] ? (
                                                <>
                                                    <Check size={20} />
                                                    Alerta activada
                                                </>
                                            ) : (
                                                <>
                                                    <Bell size={20} />
                                                    Avisar cuando haya stock
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New List Modal */}
            {showNewListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Crear Nueva Lista
                        </h3>
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Nombre de la lista"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowNewListModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateList}
                                disabled={!newListName.trim()}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-gray-300"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Compartir Lista
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Comparte este enlace con quien quieras:
                        </p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                            />
                            <button
                                onClick={copyShareUrl}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move to Cart Modal */}
            {showMoveToCartModal && cartItems && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Añadir al Carrito
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {cartItems.availableItems} de {cartItems.totalItems} productos están disponibles
                        </p>

                        <div className="space-y-3 mb-4">
                            {cartItems.items.map((item) => (
                                <div
                                    key={item.product._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${item.hasStock
                                        ? 'bg-green-50 dark:bg-green-900/30'
                                        : 'bg-red-50 dark:bg-red-900/30'
                                        }`}
                                >
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.hasStock
                                                ? `Talla: ${item.preferredSize || item.availableSizes[0]?.size}`
                                                : 'Sin stock'
                                            }
                                        </p>
                                    </div>
                                    {item.hasStock ? (
                                        <Check className="text-green-600" size={20} />
                                    ) : (
                                        <X className="text-red-600" size={20} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowMoveToCartModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmMoveToCart}
                                disabled={cartItems.availableItems === 0}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                            >
                                Añadir {cartItems.availableItems} producto(s)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistPage;


