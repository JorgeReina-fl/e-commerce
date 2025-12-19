const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// ============================================
// PUBLIC ENDPOINTS
// ============================================

// @route   POST /api/coupons/validate
// @desc    Validate a coupon and calculate discount
// @access  Public
router.post('/validate', async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        // Validate input
        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                valid: false,
                message: 'Código de cupón es requerido'
            });
        }

        if (cartTotal === undefined || cartTotal === null || isNaN(cartTotal)) {
            return res.status(400).json({
                valid: false,
                message: 'Total del carrito es requerido'
            });
        }

        const numericCartTotal = parseFloat(cartTotal);

        if (numericCartTotal < 0) {
            return res.status(400).json({
                valid: false,
                message: 'Total del carrito no puede ser negativo'
            });
        }

        // Validate coupon
        const coupon = await Coupon.validateCoupon(code, numericCartTotal);

        // Calculate discount
        const discountAmount = Coupon.calculateDiscount(coupon, numericCartTotal);
        const newTotal = Math.round((numericCartTotal - discountAmount) * 100) / 100;

        res.json({
            valid: true,
            couponId: coupon._id,
            code: coupon.code,
            type: coupon.type,
            discountAmount,
            newTotal,
            message: `Cupón aplicado: -€${discountAmount.toFixed(2)}`
        });

    } catch (error) {
        res.status(400).json({
            valid: false,
            message: error.message
        });
    }
});

// ============================================
// ADMIN ENDPOINTS (CRUD)
// ============================================

// @route   GET /api/coupons/stats/summary
// @desc    Get coupon usage statistics
// @access  Private/Admin
// NOTE: This route MUST come before /:id to avoid conflict
router.get('/stats/summary', protect, admin, async (req, res) => {
    try {
        const stats = await Coupon.aggregate([
            {
                $group: {
                    _id: null,
                    totalCoupons: { $sum: 1 },
                    activeCoupons: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    },
                    totalUsage: { $sum: '$usedCount' }
                }
            }
        ]);

        const now = new Date();
        const expiredCount = await Coupon.countDocuments({
            expirationDate: { $lt: now }
        });

        res.json({
            totalCoupons: stats[0]?.totalCoupons || 0,
            activeCoupons: stats[0]?.activeCoupons || 0,
            expiredCoupons: expiredCount,
            totalUsage: stats[0]?.totalUsage || 0
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            code,
            type,
            value,
            minPurchaseAmount,
            expirationDate,
            maxUses,
            maxDiscountAmount,
            description
        } = req.body;

        console.log('[COUPON] Creating coupon with data:', req.body);

        // Validate required fields
        if (!code || !type || value === undefined || !expirationDate || !maxUses) {
            return res.status(400).json({
                message: 'Faltan campos requeridos: código, tipo, valor, fecha de expiración y usos máximos son obligatorios'
            });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                message: 'Ya existe un cupón con este código'
            });
        }

        const coupon = new Coupon({
            code,
            type,
            value,
            minPurchaseAmount: minPurchaseAmount || 0,
            expirationDate,
            maxUses,
            maxDiscountAmount: maxDiscountAmount || null,
            description: description || ''
        });

        await coupon.save();

        console.log('[COUPON] Created successfully:', coupon.code);

        res.status(201).json({
            message: 'Cupón creado exitosamente',
            coupon
        });

    } catch (error) {
        console.error('[COUPON] Error creating:', error.message);
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Ya existe un cupón con este código'
            });
        }
        // Return more detailed error message
        res.status(400).json({ message: error.message || 'Error al crear cupón' });
    }
});

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.find({})
            .sort({ createdAt: -1 });

        res.json(coupons);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/coupons/:id
// @desc    Get coupon by ID
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }

        res.json(coupon);

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/coupons/:id
// @desc    Update coupon
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }

        const {
            code,
            type,
            value,
            minPurchaseAmount,
            expirationDate,
            maxUses,
            maxDiscountAmount,
            description,
            isActive
        } = req.body;

        // If code is being changed, check for duplicates
        if (code && code.toUpperCase() !== coupon.code) {
            const existingCoupon = await Coupon.findOne({
                code: code.toUpperCase(),
                _id: { $ne: coupon._id }
            });
            if (existingCoupon) {
                return res.status(400).json({
                    message: 'Ya existe un cupón con este código'
                });
            }
        }

        // Update fields
        if (code !== undefined) coupon.code = code;
        if (type !== undefined) coupon.type = type;
        if (value !== undefined) coupon.value = value;
        if (minPurchaseAmount !== undefined) coupon.minPurchaseAmount = minPurchaseAmount;
        if (expirationDate !== undefined) coupon.expirationDate = expirationDate;
        if (maxUses !== undefined) coupon.maxUses = maxUses;
        if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
        if (description !== undefined) coupon.description = description;
        if (isActive !== undefined) coupon.isActive = isActive;

        await coupon.save();

        res.json({
            message: 'Cupón actualizado exitosamente',
            coupon
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Ya existe un cupón con este código'
            });
        }
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }

        await coupon.deleteOne();

        res.json({ message: 'Cupón eliminado exitosamente' });

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
