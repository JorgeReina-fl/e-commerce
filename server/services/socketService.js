/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOCKET SERVICE - WebSocket Management for Real-time Features
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This service manages all WebSocket connections using Socket.io.
 * It provides real-time capabilities for:
 * - Stock updates (when inventory changes)
 * - Notifications (instant delivery to users)
 * - Admin broadcasts (announcements, system updates)
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Map to track online users: userId -> Set of socketIds
const onlineUsers = new Map();

/**
 * Initialize Socket.io server
 * @param {http.Server} httpServer - The HTTP server instance
 */
const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.user = decoded;
            } catch (err) {
                // Invalid token, but still allow connection for public events
                console.log('[Socket] Invalid token, connecting as guest');
            }
        }
        next();
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}${socket.userId ? ` (User: ${socket.userId})` : ' (Guest)'}`);

        // Track authenticated user
        if (socket.userId) {
            if (!onlineUsers.has(socket.userId)) {
                onlineUsers.set(socket.userId, new Set());
            }
            onlineUsers.get(socket.userId).add(socket.id);

            // Join user-specific room for targeted messages
            socket.join(`user:${socket.userId}`);
        }

        // Join public room for broadcast events (stock updates, etc.)
        socket.join('public');

        // Handle explicit user identification (for late authentication)
        socket.on('user:identify', ({ userId }) => {
            if (userId && socket.userId === userId) {
                socket.join(`user:${userId}`);
                console.log(`[Socket] User ${userId} joined their room`);
            }
        });

        // Handle product page subscription (for real-time stock updates)
        socket.on('product:subscribe', ({ productId }) => {
            socket.join(`product:${productId}`);
            console.log(`[Socket] ${socket.id} subscribed to product ${productId}`);
        });

        socket.on('product:unsubscribe', ({ productId }) => {
            socket.leave(`product:${productId}`);
            console.log(`[Socket] ${socket.id} unsubscribed from product ${productId}`);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);

            if (socket.userId) {
                const userSockets = onlineUsers.get(socket.userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        onlineUsers.delete(socket.userId);
                    }
                }
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`[Socket] Error on ${socket.id}:`, error);
        });
    });

    console.log('[Socket] WebSocket server initialized');
    return io;
};

/**
 * Get the Socket.io instance
 * @returns {Server} The Socket.io server instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};

/**
 * Emit stock update to all clients viewing a specific product
 * @param {string} productId - The product ID
 * @param {Object} stockData - Stock update data
 */
const emitStockUpdate = (productId, stockData) => {
    if (!io) return;

    const payload = {
        productId,
        ...stockData,
        timestamp: new Date().toISOString()
    };

    // Emit to clients subscribed to this specific product
    io.to(`product:${productId}`).emit('stock:updated', payload);

    // Also emit to public room for global stock displays (e.g., product lists)
    io.to('public').emit('stock:updated', payload);

    console.log(`[Socket] Stock update emitted for product ${productId}:`, stockData);
};

/**
 * Emit notification to a specific user
 * @param {string} userId - The user ID
 * @param {Object} notification - The notification object
 */
const emitNotification = (userId, notification) => {
    if (!io) return;

    const payload = {
        notification,
        timestamp: new Date().toISOString()
    };

    io.to(`user:${userId}`).emit('notification:new', payload);
    console.log(`[Socket] Notification emitted to user ${userId}:`, notification.title);
};

/**
 * Emit notification to all connected users (admin broadcast)
 * @param {Object} notification - The notification object
 */
const broadcastNotification = (notification) => {
    if (!io) return;

    const payload = {
        notification,
        timestamp: new Date().toISOString()
    };

    io.emit('notification:broadcast', payload);
    console.log(`[Socket] Broadcast notification:`, notification.title);
};

/**
 * Get list of online user IDs
 * @returns {string[]} Array of online user IDs
 */
const getOnlineUserIds = () => {
    return Array.from(onlineUsers.keys());
};

/**
 * Check if a specific user is online
 * @param {string} userId - The user ID to check
 * @returns {boolean} True if user is online
 */
const isUserOnline = (userId) => {
    return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

/**
 * Get count of connected clients
 * @returns {number} Number of connected sockets
 */
const getConnectionCount = () => {
    if (!io) return 0;
    return io.engine.clientsCount;
};

module.exports = {
    initializeSocket,
    getIO,
    emitStockUpdate,
    emitNotification,
    broadcastNotification,
    getOnlineUserIds,
    isUserOnline,
    getConnectionCount
};
