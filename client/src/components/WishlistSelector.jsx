import { useState } from 'react';
import { Heart, Plus, Check, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

/**
 * WishlistSelector - A dropdown component that allows users to select
 * which wishlist to add a product to, or create a new wishlist.
 */
const WishlistSelector = ({ productId, onClose }) => {
    const {
        wishlists,
        addToWishlist,
        isInSpecificWishlist,
        createWishlist
    } = useWishlist();

    const [showNewList, setShowNewList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddToList = async (wishlistId) => {
        setLoading(true);
        await addToWishlist(productId, wishlistId);
        setLoading(false);
        onClose?.();
    };

    const handleCreateAndAdd = async () => {
        if (!newListName.trim()) return;
        setLoading(true);
        const newList = await createWishlist(newListName.trim());
        if (newList) {
            await addToWishlist(productId, newList._id);
        }
        setLoading(false);
        setNewListName('');
        setShowNewList(false);
        onClose?.();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">
                    Añadir a lista
                </span>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Wishlists */}
            <div className="max-h-48 overflow-y-auto">
                {wishlists.map((wishlist) => {
                    const isInList = isInSpecificWishlist(productId, wishlist._id);

                    return (
                        <button
                            key={wishlist._id}
                            onClick={() => !isInList && handleAddToList(wishlist._id)}
                            disabled={isInList || loading}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isInList
                                ? 'bg-primary-light/50 dark:bg-primary/10 text-primary dark:text-primary'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                } ${loading ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <Heart
                                    size={18}
                                    className={isInList ? 'text-red-500' : 'text-gray-400'}
                                    fill={isInList ? 'currentColor' : 'none'}
                                />
                                <span className="font-medium">{wishlist.name}</span>
                            </div>
                            {isInList && <Check size={18} className="text-primary" />}
                        </button>
                    );
                })}
            </div>

            {/* Create New List */}
            <div className="border-t dark:border-gray-700">
                {showNewList ? (
                    <div className="p-3">
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Nombre de la lista"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-2"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowNewList(false);
                                    setNewListName('');
                                }}
                                className="flex-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateAndAdd}
                                disabled={!newListName.trim() || loading}
                                className="flex-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-gray-300"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowNewList(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-primary dark:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="font-medium">Crear nueva lista</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default WishlistSelector;


