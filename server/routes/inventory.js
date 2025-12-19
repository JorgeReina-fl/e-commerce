const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { logStockMovement, getLowStockProducts, getRestockSuggestions } = require('../services/inventoryService');
const { emitStockUpdate } = require('../services/socketService');
const router = express.Router();

// @route   GET /api/inventory/low-stock
// @desc    Get products with low stock
// @access  Private/Admin
router.get('/low-stock', protect, admin, async (req, res) => {
    try {
        const lowStockProducts = await getLowStockProducts();
        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/inventory/restock-suggestions
// @desc    Get products needing restock
// @access  Private/Admin
router.get('/restock-suggestions', protect, admin, async (req, res) => {
    try {
        const suggestions = await getRestockSuggestions();
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/inventory/movements
// @desc    Get stock movement history
// @access  Private/Admin
router.get('/movements', protect, admin, async (req, res) => {
    try {
        const { productId, type, startDate, endDate, limit = 50, page = 1 } = req.query;

        const filter = {};

        if (productId) {
            filter.product = productId;
        }

        if (type) {
            filter.type = type;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [movements, total] = await Promise.all([
            StockMovement.find(filter)
                .populate('product', 'name image')
                .populate('user', 'name email')
                .populate('order', '_id')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            StockMovement.countDocuments(filter)
        ]);

        res.json({
            movements,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/inventory/movements/:productId
// @desc    Get movements for specific product
// @access  Private/Admin
router.get('/movements/:productId', protect, admin, async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const movements = await StockMovement.find({ product: req.params.productId })
            .populate('user', 'name email')
            .populate('order', '_id')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/inventory/adjust
// @desc    Adjust stock manually
// @access  Private/Admin
router.post('/adjust', protect, admin, async (req, res) => {
    try {
        const { productId, size, quantity, reason, type = 'ajuste' } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the size stock
        const sizeStockIndex = product.sizeStock.findIndex(ss => ss.size === size);
        if (sizeStockIndex === -1) {
            return res.status(400).json({ message: 'Size not found for this product' });
        }

        const previousStock = product.sizeStock[sizeStockIndex].stock;
        const newStock = previousStock + parseInt(quantity);

        if (newStock < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' });
        }

        // Update stock
        product.sizeStock[sizeStockIndex].stock = newStock;
        await product.save();

        // Log the movement
        const movement = await logStockMovement({
            productId: product._id,
            type,
            quantity: parseInt(quantity),
            previousStock,
            newStock,
            size,
            reason: reason || `Ajuste manual de stock`,
            userId: req.user._id
        });

        // Emit real-time stock update via WebSocket
        emitStockUpdate(product._id.toString(), {
            size,
            stock: newStock,
            previousStock,
            type,
            productName: product.name
        });

        res.json({
            message: 'Stock adjusted successfully',
            movement,
            product: {
                _id: product._id,
                name: product.name,
                sizeStock: product.sizeStock
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/inventory/settings/:productId
// @desc    Update inventory settings for a product
// @access  Private/Admin
router.put('/settings/:productId', protect, admin, async (req, res) => {
    try {
        const { lowStockThreshold, autoRestockEnabled, autoRestockLevel } = req.body;

        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (lowStockThreshold !== undefined) {
            product.lowStockThreshold = lowStockThreshold;
        }
        if (autoRestockEnabled !== undefined) {
            product.autoRestockEnabled = autoRestockEnabled;
        }
        if (autoRestockLevel !== undefined) {
            product.autoRestockLevel = autoRestockLevel;
        }

        await product.save();

        res.json({
            message: 'Inventory settings updated',
            product: {
                _id: product._id,
                name: product.name,
                lowStockThreshold: product.lowStockThreshold,
                autoRestockEnabled: product.autoRestockEnabled,
                autoRestockLevel: product.autoRestockLevel
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({}).lean();

        let totalProducts = products.length;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalStockValue = 0;

        for (const product of products) {
            let hasLowStock = false;
            let hasOutOfStock = false;

            if (product.sizeStock && product.sizeStock.length > 0) {
                for (const ss of product.sizeStock) {
                    totalStockValue += ss.stock * (product.price || 0);
                    if (ss.stock === 0) hasOutOfStock = true;
                    else if (ss.stock <= (product.lowStockThreshold || 5)) hasLowStock = true;
                }
            }

            if (hasOutOfStock) outOfStockCount++;
            else if (hasLowStock) lowStockCount++;
        }

        // Get recent movements
        const recentMovements = await StockMovement.find({})
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get movement counts by type (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const movementsByType = await StockMovement.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$type', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
        ]);

        res.json({
            totalProducts,
            lowStockCount,
            outOfStockCount,
            totalStockValue,
            recentMovements,
            movementsByType
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
