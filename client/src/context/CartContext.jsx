import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const CartContext = createContext();

// Cart actions
const ACTIONS = {
    SET_ITEMS: 'SET_ITEMS',
    SET_LOADING: 'SET_LOADING',
    ADD_ITEM_LOCAL: 'ADD_ITEM_LOCAL',
    REMOVE_ITEM_LOCAL: 'REMOVE_ITEM_LOCAL',
    UPDATE_QUANTITY_LOCAL: 'UPDATE_QUANTITY_LOCAL',
    CLEAR_CART_LOCAL: 'CLEAR_CART_LOCAL',
    LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_ITEMS:
            return { ...state, items: action.payload, loading: false };

        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case ACTIONS.ADD_ITEM_LOCAL: {
            const { product, size, quantity = 1, maxStock } = action.payload;
            const existingItemIndex = state.items.findIndex(
                item => item.product._id === product._id && item.size === size
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...state.items];
                const currentQty = updatedItems[existingItemIndex].quantity;
                // SECURITY: Limit to available stock
                const newQty = Math.min(currentQty + quantity, maxStock);

                if (newQty === currentQty) {
                    // Already at max stock
                    return state;
                }

                updatedItems[existingItemIndex].quantity = newQty;
                return { ...state, items: updatedItems };
            } else {
                // SECURITY: Limit initial quantity to available stock
                const validQuantity = Math.min(quantity, maxStock);
                return {
                    ...state,
                    items: [...state.items, { product, size, quantity: validQuantity }]
                };
            }
        }

        case ACTIONS.REMOVE_ITEM_LOCAL:
            return {
                ...state,
                items: state.items.filter((_, index) => index !== action.payload)
            };

        case ACTIONS.UPDATE_QUANTITY_LOCAL: {
            const { index, quantity, maxStock } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((_, i) => i !== index)
                };
            }
            const updatedItems = [...state.items];
            // SECURITY: Limit to available stock
            updatedItems[index].quantity = Math.min(quantity, maxStock);
            return { ...state, items: updatedItems };
        }

        case ACTIONS.CLEAR_CART_LOCAL:
            return { ...state, items: [] };

        case ACTIONS.LOAD_CART:
            return { ...state, items: action.payload };

        default:
            return state;
    }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [], loading: false });
    const [synced, setSynced] = useState(false);
    const { user, token } = useAuth();

    const isGuest = !user;

    // Load cart on mount or user change
    useEffect(() => {
        if (user && token && !synced) {
            // User logged in: sync localStorage -> DB
            syncCartOnLogin();
        } else if (isGuest) {
            // Guest: load from localStorage
            loadLocalCart();
        }
    }, [user, token]);

    // Sync localStorage cart to DB on login
    const syncCartOnLogin = async () => {
        const localItems = JSON.parse(localStorage.getItem('luxethread_cart') || '[]');

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });

            // Transform localStorage format to API format
            const formattedItems = localItems.map(item => ({
                productId: item.product._id,
                size: item.size,
                quantity: item.quantity
            }));

            const response = await axios.post(
                `${API_URL}/cart/sync`,
                { localItems: formattedItems },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            dispatch({ type: ACTIONS.SET_ITEMS, payload: response.data.items || [] });
            localStorage.removeItem('luxethread_cart');
            setSynced(true);
        } catch (error) {
            console.error('Cart sync error:', error);
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            toast.error('Error al sincronizar carrito');
        }
    };

    const loadLocalCart = () => {
        const savedCart = localStorage.getItem('luxethread_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                dispatch({ type: ACTIONS.LOAD_CART, payload: parsedCart });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    };

    // Listen for storage changes from other tabs (cross-tab sync)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'luxethread_cart' && isGuest) {
                if (e.newValue) {
                    try {
                        const updatedCart = JSON.parse(e.newValue);
                        dispatch({ type: ACTIONS.LOAD_CART, payload: updatedCart });
                    } catch (error) {
                        console.error('Error parsing cart from storage event:', error);
                    }
                } else {
                    // Cart was cleared in another tab
                    dispatch({ type: ACTIONS.LOAD_CART, payload: [] });
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isGuest]);

    // Save to localStorage for guests
    useEffect(() => {
        if (isGuest && state.items.length >= 0) {
            localStorage.setItem('luxethread_cart', JSON.stringify(state.items));
        }
    }, [state.items, isGuest]);

    // Calculate cart total
    const getCartTotal = () => {
        return state.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    // Get cart item count
    const getCartCount = () => {
        return state.items.reduce((count, item) => count + item.quantity, 0);
    };

    // Helper: Get stock for a product/size/color/material combination
    const getProductStock = (product, size, color, material) => {
        // If specific variant is selected, check detailed inventory first
        if (product?.inventory?.length > 0 && color && material) {
            const variant = product.inventory.find(
                i => i.size === size && i.color === color && i.material === material
            );
            if (variant) return variant.stock;
        }

        // Fallback to sizeStock if no updated inventory or simple product
        if (!product?.sizeStock) return 0;
        const sizeStock = product.sizeStock.find(s => s.size === size);
        return sizeStock?.stock || 0;
    };

    // Add item (DB or localStorage)
    const addItem = async (product, size, quantity = 1) => {
        if (!size) {
            toast.error('Por favor selecciona una talla');
            return;
        }

        if (quantity <= 0) {
            toast.error('Cantidad inválida');
            return;
        }

        // Get available stock
        // Get available stock
        const maxStock = getProductStock(product, size, product.selectedColor, product.selectedMaterial);

        if (maxStock <= 0) {
            toast.error('Este producto está agotado');
            return;
        }

        // Check current quantity in cart
        const existingItem = state.items.find(
            item => item.product._id === product._id && item.size === size
        );
        const currentInCart = existingItem?.quantity || 0;

        if (currentInCart >= maxStock) {
            toast.error(`Ya tienes el máximo disponible (${maxStock}) en el carrito`);
            return;
        }

        const canAdd = Math.min(quantity, maxStock - currentInCart);

        if (canAdd < quantity) {
            toast(`Solo se añadieron ${canAdd} unidades (stock limitado)`, { icon: '⚠️' });
        }

        if (user && token) {
            // Add to DB
            try {
                const response = await axios.post(
                    `${API_URL}/cart/items`,
                    { productId: product._id, size, quantity: canAdd },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch({ type: ACTIONS.SET_ITEMS, payload: response.data.items || [] });
            } catch (error) {
                console.error('Add to cart error:', error);
                toast.error(error.response?.data?.message || 'Error al añadir al carrito');
            }
        } else {
            // Add to localStorage with stock limit
            dispatch({
                type: ACTIONS.ADD_ITEM_LOCAL,
                payload: { product, size, quantity: canAdd, maxStock }
            });
        }
    };

    // Remove item
    const removeItem = async (index) => {
        if (user && token) {
            try {
                const response = await axios.delete(
                    `${API_URL}/cart/items/${index}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch({ type: ACTIONS.SET_ITEMS, payload: response.data.items || [] });
            } catch (error) {
                console.error('Remove from cart error:', error);
                toast.error('Error al eliminar del carrito');
            }
        } else {
            dispatch({ type: ACTIONS.REMOVE_ITEM_LOCAL, payload: index });
        }
    };

    // Update quantity
    const updateQuantity = async (index, quantity) => {
        // Get the item to check stock
        const item = state.items[index];
        if (!item) return;

        const maxStock = getProductStock(item.product, item.size, item.product.selectedColor, item.product.selectedMaterial);

        // Validate quantity
        if (quantity > maxStock) {
            toast.error(`Solo hay ${maxStock} unidades disponibles`);
            return;
        }

        if (user && token) {
            try {
                const response = await axios.put(
                    `${API_URL}/cart/items/${index}`,
                    { quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch({ type: ACTIONS.SET_ITEMS, payload: response.data.items || [] });
            } catch (error) {
                console.error('Update quantity error:', error);
                toast.error(error.response?.data?.message || 'Error al actualizar cantidad');
            }
        } else {
            dispatch({
                type: ACTIONS.UPDATE_QUANTITY_LOCAL,
                payload: { index, quantity, maxStock }
            });
        }
    };

    // Clear cart
    const clearCart = async () => {
        if (user && token) {
            try {
                await axios.delete(
                    `${API_URL}/cart`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch({ type: ACTIONS.SET_ITEMS, payload: [] });
            } catch (error) {
                console.error('Clear cart error:', error);
                toast.error('Error al limpiar carrito');
            }
        } else {
            dispatch({ type: ACTIONS.CLEAR_CART_LOCAL });
        }
    };

    // Validate cart before checkout (checks current stock)
    const validateCart = async () => {
        if (user && token) {
            try {
                const response = await axios.post(
                    `${API_URL}/cart/validate`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return response.data;
            } catch (error) {
                console.error('Validate cart error:', error);
                return { valid: false, issues: [{ message: 'Error de validación' }] };
            }
        } else {
            // Validate guest cart locally (fetch fresh stock data)
            const issues = [];
            for (const item of state.items) {
                try {
                    const { data: product } = await axios.get(`${API_URL}/products/${item.product._id}`);
                    const sizeStock = product.sizeStock?.find(s => s.size === item.size);
                    const availableStock = sizeStock?.stock || 0;

                    if (availableStock === 0) {
                        issues.push({
                            type: 'out_of_stock',
                            productName: item.product.name,
                            size: item.size,
                            message: `${item.product.name} (${item.size}) está agotado`
                        });
                    } else if (item.quantity > availableStock) {
                        issues.push({
                            type: 'insufficient_stock',
                            productName: item.product.name,
                            size: item.size,
                            requested: item.quantity,
                            available: availableStock,
                            message: `${item.product.name} (${item.size}): solo quedan ${availableStock} unidades`
                        });
                    }
                } catch (error) {
                    issues.push({
                        type: 'error',
                        message: `Error al validar ${item.product.name}`
                    });
                }
            }
            return { valid: issues.length === 0, issues };
        }
    };

    const value = {
        items: state.items,
        loading: state.loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        validateCart,
        getProductStock
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
