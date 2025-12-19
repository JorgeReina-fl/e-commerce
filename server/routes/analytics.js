const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const router = express.Router();

// @route   GET /api/analytics/abandoned-carts
// @desc    Get abandoned carts for admin analysis
// @access  Private/Admin
router.get('/abandoned-carts', protect, admin, async (req, res) => {
    try {
        const abandonedThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

        const abandonedCarts = await Cart.find({
            lastActive: { $lt: abandonedThreshold },
            'items.0': { $exists: true }  // Has at least 1 item
        })
            .populate('user', 'name email')
            .populate('items.product', 'name price image')
            .sort({ lastActive: -1 })
            .limit(50); // Limit to most recent 50

        // Calculate stats
        const totalValue = abandonedCarts.reduce((sum, cart) => {
            const cartTotal = cart.items.reduce((itemSum, item) =>
                itemSum + (item.price * item.quantity), 0
            );
            return sum + cartTotal;
        }, 0);

        const stats = {
            totalAbandoned: abandonedCarts.length,
            totalValue: totalValue,
            averageValue: abandonedCarts.length > 0 ? totalValue / abandonedCarts.length : 0,
            carts: abandonedCarts.map(cart => ({
                _id: cart._id,
                user: cart.user,
                items: cart.items,
                itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                total: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                lastActive: cart.lastActive,
                isAbandoned: cart.isAbandoned,
                hoursSinceActive: Math.floor((Date.now() - cart.lastActive) / (1000 * 60 * 60))
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error('Abandoned carts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/analytics/mark-abandoned
// @desc    Mark carts as abandoned (for cron job or manual trigger)
// @access  Private/Admin
router.post('/mark-abandoned', protect, admin, async (req, res) => {
    try {
        const abandonedThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await Cart.updateMany(
            {
                lastActive: { $lt: abandonedThreshold },
                isAbandoned: false,
                'items.0': { $exists: true }
            },
            {
                $set: { isAbandoned: true }
            }
        );

        res.json({
            message: 'Abandoned carts marked',
            modified: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark abandoned error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/cart-stats
// @desc    Get overall cart statistics
// @access  Private/Admin
router.get('/cart-stats', protect, admin, async (req, res) => {
    try {
        const totalCarts = await Cart.countDocuments({ 'items.0': { $exists: true } });
        const abandonedCarts = await Cart.countDocuments({ isAbandoned: true });
        const activeCarts = await Cart.countDocuments({
            isAbandoned: false,
            'items.0': { $exists: true }
        });

        const allCarts = await Cart.find({ 'items.0': { $exists: true } })
            .populate('items.product', 'price');

        const totalValue = allCarts.reduce((sum, cart) => {
            const cartTotal = cart.items.reduce((itemSum, item) =>
                itemSum + (item.price * item.quantity), 0
            );
            return sum + cartTotal;
        }, 0);

        res.json({
            totalCarts,
            activeCarts,
            abandonedCarts,
            abandonmentRate: totalCarts > 0 ? ((abandonedCarts / totalCarts) * 100).toFixed(2) : 0,
            totalValue: totalValue.toFixed(2),
            averageCartValue: totalCarts > 0 ? (totalValue / totalCarts).toFixed(2) : 0
        });
    } catch (error) {
        console.error('Cart stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Import analytics and export services
const analyticsService = require('../services/analyticsService');
const exportService = require('../services/exportService');

// @route   GET /api/analytics/top-products
// @desc    Get top selling products
// @access  Private/Admin
router.get('/top-products', protect, admin, async (req, res) => {
    try {
        const { limit = 10, startDate, endDate } = req.query;
        const topProducts = await analyticsService.getTopProducts(parseInt(limit), startDate, endDate);
        res.json(topProducts);
    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/cart-abandonment
// @desc    Get cart abandonment analysis
// @access  Private/Admin
router.get('/cart-abandonment', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const abandonment = await analyticsService.getCartAbandonment(startDate, endDate);
        res.json(abandonment);
    } catch (error) {
        console.error('Cart abandonment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/customer-segmentation
// @desc    Get customer segmentation (RFM analysis)
// @access  Private/Admin
router.get('/customer-segmentation', protect, admin, async (req, res) => {
    try {
        const segmentation = await analyticsService.getCustomerSegmentation();
        res.json(segmentation);
    } catch (error) {
        console.error('Customer segmentation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/kpis
// @desc    Get comprehensive KPIs
// @access  Private/Admin
router.get('/kpis', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const kpis = await analyticsService.getKPIs(startDate, endDate);
        res.json(kpis);
    } catch (error) {
        console.error('KPIs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/revenue-trends
// @desc    Get revenue trends
// @access  Private/Admin
router.get('/revenue-trends', protect, admin, async (req, res) => {
    try {
        const { period = 'day', limit = 30 } = req.query;
        const trends = await analyticsService.getRevenueTrends(period, parseInt(limit));
        res.json(trends);
    } catch (error) {
        console.error('Revenue trends error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/export/pdf
// @desc    Export analytics report as PDF
// @access  Private/Admin
router.get('/export/pdf', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        await exportService.generatePDFReport(res, 'full', startDate, endDate);
    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/export/excel
// @desc    Export analytics report as Excel
// @access  Private/Admin
router.get('/export/excel', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        await exportService.generateExcelReport(res, 'full', startDate, endDate);
    } catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
