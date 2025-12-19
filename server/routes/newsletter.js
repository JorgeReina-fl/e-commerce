const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const sendEmail = require('../utils/sendEmail');

// SECURITY: Rate limiter for newsletter (3 per hour per IP)
const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { message: 'Demasiados intentos. Intenta de nuevo en 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// @route   POST /api/newsletter
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', newsletterLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Por favor ingresa un email' });
        }

        // SECURITY: Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 254) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email: normalizedEmail });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'Este email ya está suscrito' });
        }

        const subscriber = new Subscriber({ email: normalizedEmail });
        await subscriber.save();

        // Send welcome email
        const message = `
            <h2>¡Bienvenido a LuxeThread!</h2>
            <p>Gracias por suscribirte a nuestra newsletter.</p>
            <p>Pronto recibirás noticias sobre nuestras últimas colecciones y ofertas exclusivas.</p>
        `;

        try {
            await sendEmail({
                to: email,
                subject: '¡Gracias por suscribirte a LuxeThread!',
                htmlContent: message
            });
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }

        res.status(201).json({ message: '¡Te has suscrito correctamente!' });

    } catch (error) {
        console.error('Newsletter error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Este email ya está suscrito' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
