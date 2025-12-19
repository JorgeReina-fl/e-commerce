require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const path = require('path');
const { initializeSocket, getConnectionCount } = require('./services/socketService');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const newsletterRoutes = require('./routes/newsletter');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notifications');
const stockAlertRoutes = require('./routes/stockAlerts');
const inventoryRoutes = require('./routes/inventory');
const marketingRoutes = require('./routes/marketing');
const sitemapRoutes = require('./routes/sitemap');
const couponRoutes = require('./routes/coupons');
const configRoutes = require('./routes/config');
const { startScheduledJobs } = require('./jobs/scheduledJobs');
const { getCacheStats, clearCache } = require('./middleware/cacheMiddleware');

const app = express();

// Trust proxy (Render/Vercel/Heroku)
// Required for accurate IP limiting behind load balancers
app.set('trust proxy', 1);

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Connect to MongoDB
connectDB();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Global rate limiter (100 requests per minute per IP)
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { message: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/products') // Allow more product browsing
});

// Security headers
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Middleware
app.use(cors());
app.use(compression()); // Gzip compression
app.use(globalLimiter);
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/config', configRoutes);

// Static files with cache headers (1 year for images)
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), {
    maxAge: '1y',
    etag: true,
    lastModified: true
}));

// Cache stats endpoint (admin only - SECURED)
const { protect, admin } = require('./middleware/authMiddleware');

app.get('/api/cache/stats', protect, admin, (req, res) => {
    res.json(getCacheStats());
});

// Clear cache endpoint (admin only - SECURED)
app.post('/api/cache/clear', protect, admin, (req, res) => {
    clearCache();
    res.json({ message: 'Cache cleared' });
});

// WebSocket stats endpoint (admin only)
app.get('/api/socket/stats', protect, admin, (req, res) => {
    res.json({
        connections: getConnectionCount(),
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'LuxeThread API is running',
        compression: true,
        websockets: true,
        connections: getConnectionCount()
    });
});

const PORT = process.env.PORT || 5000;

// Use HTTP server instead of app.listen for Socket.io support
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('[PERF] Compression enabled');
    console.log('[WS] WebSocket server ready');
    // Start scheduled jobs
    startScheduledJobs();
});
