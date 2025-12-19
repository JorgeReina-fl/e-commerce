const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const StockAlert = require('../models/StockAlert');
const Product = require('../models/Product');
const router = express.Router();

// @route   GET /api/stock-alerts
// @desc    Get user's stock alerts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const alerts = await StockAlert.find({
            user: req.user._id,
            active: true
        }).populate('product', 'name price image sizeStock');

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/stock-alerts/:productId
// @desc    Subscribe to stock alert
// @access  Private
router.post('/:productId', protect, async (req, res) => {
    try {
        const { size } = req.body;

        // Verify product exists
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Check if alert already exists
        const existingAlert = await StockAlert.findOne({
            user: req.user._id,
            product: req.params.productId,
            size: size || null
        });

        if (existingAlert) {
            if (existingAlert.active) {
                return res.status(400).json({ message: 'Ya tienes una alerta para este producto' });
            }
            // Reactivate existing alert
            existingAlert.active = true;
            existingAlert.notified = false;
            await existingAlert.save();
            return res.json(existingAlert);
        }

        // Create new alert
        const alert = await StockAlert.create({
            user: req.user._id,
            product: req.params.productId,
            size: size || null,
            email: req.user.email
        });

        await alert.populate('product', 'name price image sizeStock');

        res.status(201).json(alert);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Ya tienes una alerta para este producto' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/stock-alerts/:productId
// @desc    Unsubscribe from stock alert
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
    try {
        const { size } = req.query;

        const alert = await StockAlert.findOneAndUpdate(
            {
                user: req.user._id,
                product: req.params.productId,
                size: size || null
            },
            { active: false },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: 'Alerta no encontrada' });
        }

        res.json({ message: 'Alerta desactivada' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/stock-alerts/check/:productId
// @desc    Check if user has alert for product
// @access  Private
router.get('/check/:productId', protect, async (req, res) => {
    try {
        const { size } = req.query;

        const alert = await StockAlert.findOne({
            user: req.user._id,
            product: req.params.productId,
            size: size || null,
            active: true
        });

        res.json({ hasAlert: !!alert });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
