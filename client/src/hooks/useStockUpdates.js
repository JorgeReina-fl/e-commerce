/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useStockUpdates Hook - Real-time Stock Updates via WebSocket
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook provides real-time stock updates for a specific product.
 * It automatically subscribes to the product's stock changes and updates
 * the local state when changes occur.
 * 
 * Usage:
 * const { stockData, lastUpdate, isUpdating } = useStockUpdates(productId, initialSizeStock);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const useStockUpdates = (productId, initialSizeStock = []) => {
    const { socket, subscribeToProduct, unsubscribeFromProduct, isConnected } = useSocket();
    const [sizeStock, setSizeStock] = useState(initialSizeStock);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const timeoutRef = useRef(null);

    // Update initial stock when prop changes
    useEffect(() => {
        setSizeStock(initialSizeStock);
    }, [JSON.stringify(initialSizeStock)]);

    // Subscribe to product stock updates
    useEffect(() => {
        if (!productId || !isConnected) return;

        // Subscribe to this product's updates
        subscribeToProduct(productId);

        // Cleanup: unsubscribe when component unmounts or productId changes
        return () => {
            unsubscribeFromProduct(productId);
        };
    }, [productId, isConnected, subscribeToProduct, unsubscribeFromProduct]);

    // Listen for stock updates
    useEffect(() => {
        if (!socket || !productId) return;

        const handleStockUpdate = (data) => {
            // Only process updates for this product
            if (data.productId !== productId) return;

            console.log('[Stock] Real-time update received:', data);

            // Trigger update animation
            setIsUpdating(true);

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Update the specific size's stock
            setSizeStock(prevStock => {
                const updatedStock = prevStock.map(item => {
                    if (item.size === data.size) {
                        return { ...item, stock: data.stock };
                    }
                    return item;
                });
                return updatedStock;
            });

            // Record the update
            setLastUpdate({
                size: data.size,
                stock: data.stock,
                previousStock: data.previousStock,
                type: data.type,
                timestamp: new Date().toISOString()
            });

            // Remove updating animation after 2 seconds
            timeoutRef.current = setTimeout(() => {
                setIsUpdating(false);
            }, 2000);
        };

        socket.on('stock:updated', handleStockUpdate);

        return () => {
            socket.off('stock:updated', handleStockUpdate);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [socket, productId]);

    // Get stock for a specific size
    const getStockForSize = useCallback((size) => {
        const sizeData = sizeStock.find(s => s.size === size);
        return sizeData?.stock ?? 0;
    }, [sizeStock]);

    // Check if a size is in stock
    const isSizeInStock = useCallback((size) => {
        return getStockForSize(size) > 0;
    }, [getStockForSize]);

    // Check if a size is low stock (less than 5)
    const isLowStock = useCallback((size) => {
        const stock = getStockForSize(size);
        return stock > 0 && stock < 5;
    }, [getStockForSize]);

    return {
        sizeStock,
        lastUpdate,
        isUpdating,
        getStockForSize,
        isSizeInStock,
        isLowStock,
        isConnected
    };
};

export default useStockUpdates;
