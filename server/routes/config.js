const express = require('express');
const ShopConfig = require('../models/ShopConfig');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @route   GET /api/config/public
 * @desc    Get public shop configuration (branding, colors, etc.)
 * @access  Public
 */
router.get('/public', async (req, res) => {
    try {
        const config = await ShopConfig.getConfig();

        // Return configuration formatted for frontend consumption
        res.json({
            name: config.name,
            fullName: config.fullName,
            legalName: config.legalName,
            taglinePart1: config.taglinePart1,
            taglinePart2: config.taglinePart2,
            tagline: config.tagline,
            logo: config.logo,
            colors: config.colors,
            fonts: config.fonts,
            seo: config.seo,
            contact: config.contact,
            social: config.social,
            currency: config.currency,
            shipping: config.shipping,
            features: config.features,
        });
    } catch (error) {
        console.error('Error fetching shop config:', error);
        res.status(500).json({ message: 'Error fetching configuration', error: error.message });
    }
});

/**
 * @route   GET /api/config
 * @desc    Get full shop configuration (admin only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const config = await ShopConfig.getConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching configuration', error: error.message });
    }
});

/**
 * @route   PUT /api/config
 * @desc    Update shop configuration
 * @access  Private/Admin
 */
router.put('/', protect, admin, async (req, res) => {
    try {
        const updates = req.body;

        // Validate that updates is an object
        if (typeof updates !== 'object' || updates === null) {
            return res.status(400).json({ message: 'Invalid configuration data' });
        }

        const config = await ShopConfig.updateConfig(updates);
        res.json({
            message: 'Configuration updated successfully',
            config
        });
    } catch (error) {
        console.error('Error updating shop config:', error);
        res.status(500).json({ message: 'Error updating configuration', error: error.message });
    }
});

/**
 * @route   PATCH /api/config/colors
 * @desc    Update only colors (convenience endpoint)
 * @access  Private/Admin
 */
router.patch('/colors', protect, admin, async (req, res) => {
    try {
        const { colors } = req.body;

        if (!colors) {
            return res.status(400).json({ message: 'Colors object is required' });
        }

        const config = await ShopConfig.updateConfig({ colors });
        res.json({
            message: 'Colors updated successfully',
            colors: config.colors
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating colors', error: error.message });
    }
});

/**
 * @route   PATCH /api/config/branding
 * @desc    Update branding info (name, tagline, logo)
 * @access  Private/Admin
 */
router.patch('/branding', protect, admin, async (req, res) => {
    try {
        const { name, fullName, legalName, taglinePart1, taglinePart2, tagline, logo } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (fullName) updates.fullName = fullName;
        if (legalName) updates.legalName = legalName;
        if (taglinePart1) updates.taglinePart1 = taglinePart1;
        if (taglinePart2) updates.taglinePart2 = taglinePart2;
        if (tagline) updates.tagline = tagline;
        if (logo) updates.logo = logo;

        const config = await ShopConfig.updateConfig(updates);
        res.json({
            message: 'Branding updated successfully',
            config: {
                name: config.name,
                fullName: config.fullName,
                legalName: config.legalName,
                taglinePart1: config.taglinePart1,
                taglinePart2: config.taglinePart2,
                tagline: config.tagline,
                logo: config.logo
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating branding', error: error.message });
    }
});

module.exports = router;
