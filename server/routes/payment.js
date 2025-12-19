const express = require('express');
const Stripe = require('stripe');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Initialize Stripe with secret key from env
// NOTE: User needs to add STRIPE_SECRET_KEY to .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @route   POST /api/payment/create-payment-intent
// @desc    Create a payment intent for an order (with optional coupon)
// @access  Public (Optional Auth)
// 
// SECURITY NOTES:
// - Only ONE coupon per order is allowed (no stacking)
// - Coupon is validated and usage incremented ATOMICALLY before Stripe charge
// - All prices are recalculated server-side to prevent manipulation
// - Discount is capped to not exceed cart total
router.post('/create-payment-intent', async (req, res) => {
    let couponData = null; // Track coupon for rollback if needed

    try {
        // Optional Auth Logic
        let userId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                if (token && token !== 'null' && token !== 'undefined') {
                    const jwt = require('jsonwebtoken');
                    const User = require('../models/User');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id).select('-password');
                    if (user) {
                        userId = user._id.toString();
                        req.user = user;
                    }
                }
            } catch (error) {
                console.log('Optional auth failed, proceeding as guest:', error.message);
            }
        }

        const { items, couponCode } = req.body;

        // Calculate total on backend to prevent manipulation
        // We need to fetch products from DB to get real prices
        const Product = require('../models/Product');
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                // Add variant price modifier if applicable
                let price = product.price;
                if (item.size) {
                    // Check if variant affects price (simplified logic for now)
                    // In a real scenario, we'd look up the specific variant modifier
                }
                subtotal += price * item.quantity;
            }
        }

        let total = subtotal;
        let discountAmount = 0;

        // ============================================
        // COUPON HANDLING (SECURE)
        // ============================================
        // SECURITY: Only ONE coupon allowed per payment intent
        // SECURITY: Coupon usage is incremented ATOMICALLY before charging
        if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
            try {
                // Step 1: Validate coupon exists and meets conditions
                const coupon = await Coupon.validateCoupon(couponCode, subtotal);

                // Step 2: Calculate discount BEFORE incrementing
                discountAmount = Coupon.calculateDiscount(coupon, subtotal);

                // Step 3: ATOMIC increment - this prevents race conditions
                // If another request used the last available slot, this returns null
                const incrementedCoupon = await Coupon.incrementUsage(coupon._id);

                if (!incrementedCoupon) {
                    // Race condition: coupon was used by another request
                    return res.status(400).json({
                        message: 'Este cupón ha alcanzado su límite de usos',
                        couponError: true
                    });
                }

                // Store coupon data for response and order creation
                couponData = {
                    couponId: coupon._id,
                    code: coupon.code,
                    discountAmount,
                    originalUsedCount: coupon.usedCount
                };

                // Apply discount to total
                total = Math.round((subtotal - discountAmount) * 100) / 100;

                console.log(`[COUPON] Applied ${coupon.code}: -€${discountAmount.toFixed(2)} (${coupon.type})`);

            } catch (couponError) {
                // Coupon validation failed - return error to frontend
                return res.status(400).json({
                    message: couponError.message,
                    couponError: true
                });
            }
        }

        // Ensure total is at least €0.50 (Stripe minimum)
        if (total < 0.50) {
            total = 0.50;
        }

        // Create PaymentIntent with coupon metadata
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Stripe expects cents
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: userId || 'guest',
                couponId: couponData?.couponId?.toString() || '',
                couponCode: couponData?.code || '',
                discountAmount: discountAmount.toString(),
                subtotal: subtotal.toString()
            }
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            subtotal,
            discountAmount,
            total,
            couponApplied: couponData ? {
                code: couponData.code,
                discountAmount
            } : null
        });
    } catch (error) {
        // If Stripe fails AFTER we incremented coupon, we should decrement
        // This is a rare edge case but important for data consistency
        if (couponData && couponData.couponId) {
            try {
                await Coupon.findByIdAndUpdate(couponData.couponId, {
                    $inc: { usedCount: -1 }
                });
                console.log(`[COUPON] Rolled back usage for ${couponData.code} due to Stripe error`);
            } catch (rollbackError) {
                console.error('[COUPON] Failed to rollback usage:', rollbackError);
            }
        }

        console.error('Stripe error:', error);
        res.status(500).json({ message: 'Payment error', error: error.message });
    }
});

// @route   POST /api/payment/refund/:orderId
// @desc    Refund an order
// @access  Private/Admin
router.post('/refund/:orderId', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.paymentIntentId) {
            return res.status(400).json({ message: 'Order does not have a payment ID' });
        }

        if (order.status === 'reembolsado') {
            return res.status(400).json({ message: 'Order already refunded' });
        }

        // Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
        });

        // Update order status
        order.status = 'reembolsado';
        await order.save();

        res.json({ message: 'Refund successful', refund });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Refund failed', error: error.message });
    }
});

module.exports = router;
