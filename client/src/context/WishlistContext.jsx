import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlists, setWishlists] = useState([]);
    const [activeWishlistId, setActiveWishlistId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();

    const API_BASE = API_URL;

    // Load wishlists when user logs in
    useEffect(() => {
        if (user && token) {
            fetchWishlists();
        } else {
            setWishlists([]);
            setActiveWishlistId(null);
        }
    }, [user, token]);

    // Fetch all wishlists from API
    const fetchWishlists = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlists(response.data);
            // Set first wishlist as active if none selected
            if (response.data.length > 0 && !activeWishlistId) {
                setActiveWishlistId(response.data[0]._id);
            }
        } catch (error) {
            console.error('Fetch wishlists error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get active wishlist
    const activeWishlist = wishlists.find(w => w._id === activeWishlistId) || wishlists[0];

    // Get all items from active wishlist
    const items = activeWishlist?.items || [];

    // Create new wishlist
    const createWishlist = async (name) => {
        if (!user) {
            toast.error('Inicia sesión para crear listas');
            return null;
        }

        try {
            const response = await axios.post(
                `${API_BASE}/wishlist`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWishlists(prev => [response.data, ...prev]);
            toast.success(`Lista "${name}" creada`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error al crear lista';
            toast.error(message);
            return null;
        }
    };

    // Rename wishlist
    const renameWishlist = async (wishlistId, newName) => {
        try {
            const response = await axios.put(
                `${API_BASE}/wishlist/${wishlistId}`,
                { name: newName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWishlists(prev => prev.map(w =>
                w._id === wishlistId ? response.data : w
            ));
            toast.success('Lista renombrada');
        } catch (error) {
            toast.error('Error al renombrar lista');
        }
    };

    // Delete wishlist
    const deleteWishlist = async (wishlistId) => {
        try {
            await axios.delete(`${API_BASE}/wishlist/${wishlistId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlists(prev => prev.filter(w => w._id !== wishlistId));
            // If deleted active wishlist, switch to first available
            if (activeWishlistId === wishlistId && wishlists.length > 1) {
                const remaining = wishlists.filter(w => w._id !== wishlistId);
                setActiveWishlistId(remaining[0]?._id);
            }
            toast.success('Lista eliminada');
        } catch (error) {
            toast.error('Error al eliminar lista');
        }
    };

    // Share wishlist (generate public link)
    const shareWishlist = async (wishlistId) => {
        try {
            const response = await axios.post(
                `${API_BASE}/wishlist/${wishlistId}/share`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchWishlists(); // Refresh to get updated isPublic status
            return response.data.shareUrl;
        } catch (error) {
            toast.error('Error al compartir lista');
            return null;
        }
    };

    // Stop sharing wishlist
    const unshareWishlist = async (wishlistId) => {
        try {
            await axios.delete(`${API_BASE}/wishlist/${wishlistId}/share`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchWishlists();
            toast.success('Compartir desactivado');
        } catch (error) {
            toast.error('Error al desactivar compartir');
        }
    };

    // Add product to a specific wishlist
    const addToWishlist = async (productId, wishlistId = activeWishlistId) => {
        if (!user) {
            toast.error('Inicia sesión para guardar favoritos');
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE}/wishlist/${wishlistId}/items/${productId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWishlists(prev => prev.map(w =>
                w._id === wishlistId ? response.data : w
            ));
            toast.success('Añadido a favoritos');
        } catch (error) {
            const message = error.response?.data?.message || 'Error al añadir a favoritos';
            toast.error(message);
        }
    };

    // Remove product from wishlist
    const removeFromWishlist = async (productId, wishlistId = activeWishlistId) => {
        try {
            const response = await axios.delete(
                `${API_BASE}/wishlist/${wishlistId}/items/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWishlists(prev => prev.map(w =>
                w._id === wishlistId ? response.data : w
            ));
            toast.success('Eliminado de favoritos');
        } catch (error) {
            toast.error('Error al eliminar de favoritos');
        }
    };

    // Check if product is in any wishlist
    const isInWishlist = (productId) => {
        return wishlists.some(wishlist =>
            wishlist.items?.some(item => item.product?._id === productId)
        );
    };

    // Check if product is in specific wishlist
    const isInSpecificWishlist = (productId, wishlistId) => {
        const wishlist = wishlists.find(w => w._id === wishlistId);
        return wishlist?.items?.some(item => item.product?._id === productId) || false;
    };

    // Toggle wishlist status (for active wishlist)
    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            // Find which wishlist has this product
            const wishlist = wishlists.find(w =>
                w.items?.some(item => item.product?._id === productId)
            );
            if (wishlist) {
                await removeFromWishlist(productId, wishlist._id);
            }
        } else {
            await addToWishlist(productId);
        }
    };

    // Clear entire wishlist
    const clearWishlist = async (wishlistId = activeWishlistId) => {
        try {
            // Remove all items one by one (or use a clear endpoint if available)
            const wishlist = wishlists.find(w => w._id === wishlistId);
            if (wishlist) {
                for (const item of wishlist.items) {
                    await axios.delete(
                        `${API_BASE}/wishlist/${wishlistId}/items/${item.product._id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
                await fetchWishlists();
                toast.success('Favoritos borrados');
            }
        } catch (error) {
            toast.error('Error al borrar favoritos');
        }
    };

    // Get items for move-to-cart
    const getItemsForCart = async (wishlistId = activeWishlistId) => {
        try {
            const response = await axios.post(
                `${API_BASE}/wishlist/${wishlistId}/move-to-cart`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            toast.error('Error al obtener productos');
            return null;
        }
    };

    // Stock alerts
    const subscribeToStockAlert = async (productId, size = null) => {
        if (!user) {
            toast.error('Inicia sesión para activar alertas');
            return false;
        }

        try {
            await axios.post(
                `${API_BASE}/stock-alerts/${productId}`,
                { size },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Te avisaremos cuando haya stock');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Error al crear alerta';
            toast.error(message);
            return false;
        }
    };

    const unsubscribeFromStockAlert = async (productId, size = null) => {
        try {
            await axios.delete(
                `${API_BASE}/stock-alerts/${productId}${size ? `?size=${size}` : ''}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Alerta desactivada');
            return true;
        } catch (error) {
            toast.error('Error al desactivar alerta');
            return false;
        }
    };

    const checkStockAlert = async (productId, size = null) => {
        if (!user) return false;

        try {
            const response = await axios.get(
                `${API_BASE}/stock-alerts/check/${productId}${size ? `?size=${size}` : ''}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.hasAlert;
        } catch (error) {
            return false;
        }
    };

    const value = {
        // Multi-list support
        wishlists,
        activeWishlist,
        activeWishlistId,
        setActiveWishlistId,
        createWishlist,
        renameWishlist,
        deleteWishlist,
        shareWishlist,
        unshareWishlist,

        // Item management (backwards compatible)
        items,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isInSpecificWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: items.length,
        totalItemsCount: wishlists.reduce((acc, w) => acc + (w.items?.length || 0), 0),

        // Move to cart
        getItemsForCart,

        // Stock alerts
        subscribeToStockAlert,
        unsubscribeFromStockAlert,
        checkStockAlert,

        // Refresh
        refreshWishlists: fetchWishlists
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};


