/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOCKET CONTEXT - WebSocket Connection Management for Real-time Features
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This context manages the Socket.io client connection and provides:
 * - Automatic connection/reconnection with authentication
 * - Socket instance access for components
 * - Connection status tracking
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Determine WebSocket URL based on environment
const getSocketUrl = () => {
    // In production/Docker, connect to the same origin (Nginx proxies to backend)
    if (import.meta.env.VITE_API_URL === '/api') {
        return window.location.origin;
    }
    // In development, connect directly to backend
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Create socket connection
        const socketUrl = getSocketUrl();
        console.log('[Socket] Connecting to:', socketUrl);

        const socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            setIsConnected(true);
            setConnectionError(null);

            // Identify user if authenticated
            if (user?._id) {
                socket.emit('user:identify', { userId: user._id });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            setConnectionError(error.message);
            setIsConnected(false);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setConnectionError(null);
        });

        socket.on('reconnect_failed', () => {
            console.error('[Socket] Reconnection failed');
            setConnectionError('Failed to reconnect to server');
        });

        // Cleanup on unmount
        return () => {
            console.log('[Socket] Cleaning up connection');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, user?._id]);

    // Subscribe to a product for stock updates
    const subscribeToProduct = (productId) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('product:subscribe', { productId });
            console.log('[Socket] Subscribed to product:', productId);
        }
    };

    // Unsubscribe from a product
    const unsubscribeFromProduct = (productId) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('product:unsubscribe', { productId });
            console.log('[Socket] Unsubscribed from product:', productId);
        }
    };

    const value = {
        socket: socketRef.current,
        isConnected,
        connectionError,
        subscribeToProduct,
        unsubscribeFromProduct
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
