/**
 * Test App Factory
 * 
 * Creates an Express app instance for testing without starting the server.
 * Uses the same routes and middleware as production BUT WITHOUT RATE LIMITING.
 */

const express = require('express');
const cors = require('cors');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';

// Import routes
const authRoutes = require('../routes/auth');
const productRoutes = require('../routes/products');
const cartRoutes = require('../routes/cart');
const orderRoutes = require('../routes/orders');
const couponRoutes = require('../routes/coupons');
const paymentRoutes = require('../routes/payment');

// Create app instance
const app = express();

// Middleware (same as server.js but WITHOUT rate limiting for tests)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Test API running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[TEST ERROR]', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
});

module.exports = app;
