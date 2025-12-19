const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get all user wishlists
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let wishlists = await Wishlist.find({ user: req.user._id })
            .populate('items.product', 'name price image category sizeStock rating numReviews discount')
            .sort({ createdAt: -1 });

        // If no wishlists, create default one
        if (wishlists.length === 0) {
            const defaultWishlist = await Wishlist.create({
                user: req.user._id,
                name: 'Mi Lista'
            });
            wishlists = [defaultWishlist];
        }

        res.json(wishlists);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/wishlist
// @desc    Create new wishlist
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name } = req.body;

        // Check limit (max 10 wishlists per user)
        const count = await Wishlist.countDocuments({ user: req.user._id });
        if (count >= 10) {
            return res.status(400).json({ message: 'Máximo 10 listas permitidas' });
        }

        const wishlist = await Wishlist.create({
            user: req.user._id,
            name: name || 'Nueva Lista'
        });

        res.status(201).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/wishlist/:id
// @desc    Update wishlist (name, isPublic)
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, isPublic } = req.body;

        const wishlist = await Wishlist.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        if (name !== undefined) wishlist.name = name;
        if (isPublic !== undefined) wishlist.isPublic = isPublic;

        await wishlist.save();
        await wishlist.populate('items.product', 'name price image category sizeStock rating numReviews discount');

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/wishlist/:id
// @desc    Delete a wishlist
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        res.json({ message: 'Lista eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/wishlist/:id/share
// @desc    Generate share link for wishlist
// @access  Private
router.post('/:id/share', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        // Generate share token if not exists
        if (!wishlist.shareToken) {
            wishlist.generateShareToken();
        }
        wishlist.isPublic = true;
        await wishlist.save();

        const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/wishlist/shared/${wishlist.shareToken}`;

        res.json({
            shareToken: wishlist.shareToken,
            shareUrl
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/wishlist/:id/share
// @desc    Disable sharing for wishlist
// @access  Private
router.delete('/:id/share', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        wishlist.isPublic = false;
        wishlist.shareToken = undefined;
        await wishlist.save();

        res.json({ message: 'Compartir desactivado' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/wishlist/shared/:token
// @desc    View shared wishlist (public)
// @access  Public
router.get('/shared/:token', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            shareToken: req.params.token,
            isPublic: true
        })
            .populate('user', 'name')
            .populate('items.product', 'name price image category sizeStock rating numReviews discount');

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada o no es pública' });
        }

        res.json({
            name: wishlist.name,
            ownerName: wishlist.user.name,
            items: wishlist.items,
            itemCount: wishlist.items.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/wishlist/:id/items/:productId
// @desc    Add product to specific wishlist
// @access  Private
router.post('/:id/items/:productId', protect, async (req, res) => {
    try {
        const { preferredSize } = req.body;

        // Verify product exists
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const wishlist = await Wishlist.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        // Check if product already in wishlist
        if (wishlist.hasProduct(req.params.productId)) {
            return res.status(400).json({ message: 'Producto ya está en la lista' });
        }

        wishlist.items.push({
            product: req.params.productId,
            lastPrice: product.price,
            preferredSize
        });
        await wishlist.save();
        await wishlist.populate('items.product', 'name price image category sizeStock rating numReviews discount');

        res.status(201).json(wishlist);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/wishlist/:id/items/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:id/items/:productId', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        if (wishlist.items.length === initialLength) {
            return res.status(404).json({ message: 'Producto no está en la lista' });
        }

        await wishlist.save();
        await wishlist.populate('items.product', 'name price image category sizeStock rating numReviews discount');

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/wishlist/:id/move-to-cart
// @desc    Get items to move to cart (returns items with stock info)
// @access  Private
router.post('/:id/move-to-cart', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product', 'name price image category sizeStock discount');

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        // Return items with stock availability for frontend to handle cart addition
        const itemsWithStock = wishlist.items.map(item => {
            const availableSizes = item.product.sizeStock
                .filter(ss => ss.stock > 0)
                .map(ss => ({ size: ss.size, stock: ss.stock }));

            return {
                product: item.product,
                preferredSize: item.preferredSize,
                availableSizes,
                hasStock: availableSizes.length > 0
            };
        });

        res.json({
            wishlistId: wishlist._id,
            wishlistName: wishlist.name,
            items: itemsWithStock,
            totalItems: itemsWithStock.length,
            availableItems: itemsWithStock.filter(i => i.hasStock).length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ================================================
// LEGACY ENDPOINTS (backwards compatibility)
// ================================================

// @route   POST /api/wishlist/legacy/:productId
// @desc    Add product to default wishlist (legacy)
// @access  Private
router.post('/legacy/:productId', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.getOrCreateDefault(req.user._id);

        if (wishlist.hasProduct(req.params.productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        wishlist.items.push({
            product: req.params.productId,
            lastPrice: product.price
        });
        await wishlist.save();
        await wishlist.populate('items.product', 'name price image category sizeStock rating numReviews discount');

        res.status(201).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/wishlist/legacy/:productId
// @desc    Remove product from default wishlist (legacy)
// @access  Private
router.delete('/legacy/:productId', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id, name: 'Mi Lista' });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.items = wishlist.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await wishlist.save();
        await wishlist.populate('items.product', 'name price image category sizeStock rating numReviews discount');

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
