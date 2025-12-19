const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Subscriber = require('../models/Subscriber');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../services/emailTemplates');

// @route   GET /api/marketing/subscribers
// @desc    Get all subscribers
// @access  Admin
router.get('/subscribers', protect, admin, async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        res.json({
            total: subscribers.length,
            active: subscribers.filter(s => s.isActive !== false).length,
            subscribers
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/marketing/campaign/new-arrivals
// @desc    Send new arrivals newsletter to all subscribers
// @access  Admin
router.post('/campaign/new-arrivals', protect, admin, async (req, res) => {
    try {
        const { days = 7, limit = 6 } = req.body;

        // Get new products
        const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const newProducts = await Product.find({
            createdAt: { $gte: daysAgo }
        }).sort({ createdAt: -1 }).limit(limit);

        if (newProducts.length === 0) {
            return res.status(400).json({ message: 'No hay productos nuevos para enviar' });
        }

        // Get active subscribers
        const subscribers = await Subscriber.find({ isActive: { $ne: false } });

        if (subscribers.length === 0) {
            return res.status(400).json({ message: 'No hay suscriptores activos' });
        }

        const emailHtml = emailTemplates.newArrivalsEmail(newProducts);
        let sent = 0;
        let failed = 0;

        for (const subscriber of subscribers) {
            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: '✨ Nuevas llegadas en LuxeThread',
                    htmlContent: emailHtml
                });
                sent++;
            } catch (error) {
                console.error(`Failed to send to ${subscriber.email}:`, error.message);
                failed++;
            }
        }

        res.json({
            message: 'Campaña enviada',
            sent,
            failed,
            productsIncluded: newProducts.length
        });
    } catch (error) {
        console.error('Error sending new arrivals campaign:', error);
        res.status(500).json({ message: 'Error al enviar la campaña' });
    }
});

// @route   POST /api/marketing/campaign/promotion
// @desc    Send promotion email to all subscribers
// @access  Admin
router.post('/campaign/promotion', protect, admin, async (req, res) => {
    try {
        const { title, subtitle, promoCode, productIds } = req.body;

        if (!title || !subtitle) {
            return res.status(400).json({ message: 'Título y subtítulo son requeridos' });
        }

        // Get products (either specified ones or products with discounts)
        let products;
        if (productIds && productIds.length > 0) {
            products = await Product.find({ _id: { $in: productIds } }).limit(6);
        } else {
            products = await Product.find({ discount: { $gt: 0 } })
                .sort({ discount: -1 })
                .limit(6);
        }

        if (products.length === 0) {
            return res.status(400).json({ message: 'No hay productos para incluir en la promoción' });
        }

        // Get active subscribers
        const subscribers = await Subscriber.find({ isActive: { $ne: false } });

        if (subscribers.length === 0) {
            return res.status(400).json({ message: 'No hay suscriptores activos' });
        }

        const emailHtml = emailTemplates.promotionEmail(title, subtitle, products, promoCode);
        let sent = 0;
        let failed = 0;

        for (const subscriber of subscribers) {
            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: `🔥 ${title}`,
                    htmlContent: emailHtml
                });
                sent++;
            } catch (error) {
                console.error(`Failed to send to ${subscriber.email}:`, error.message);
                failed++;
            }
        }

        res.json({
            message: 'Campaña de promoción enviada',
            sent,
            failed,
            productsIncluded: products.length
        });
    } catch (error) {
        console.error('Error sending promotion campaign:', error);
        res.status(500).json({ message: 'Error al enviar la campaña' });
    }
});

// @route   DELETE /api/marketing/subscribers/:id
// @desc    Remove a subscriber
// @access  Admin
router.delete('/subscribers/:id', protect, admin, async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.json({ message: 'Suscriptor eliminado' });
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        res.status(500).json({ message: 'Error al eliminar suscriptor' });
    }
});

module.exports = router;
