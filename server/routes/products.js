const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware, invalidateCache } = require('../middleware/cacheMiddleware');
const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with optional category filter
// @access  Public
router.get('/', cacheMiddleware(120), async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 8;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const category = req.query.category ? { category: req.query.category } : {};

        const count = await Product.countDocuments({ ...keyword, ...category });
        const products = await Product.find({ ...keyword, ...category })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:idOrSlug', cacheMiddleware(300), async (req, res) => {
    try {
        const { idOrSlug } = req.params;

        // Try to find by ID first, then by slug
        let product;
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(idOrSlug);
        }

        if (!product) {
            product = await Product.findOne({ slug: idOrSlug });
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            name, description, price, category, sizeStock, image,
            images, colors, materials, sizes, inventory, discount, tags
        } = req.body;

        // Validation
        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            sizeStock: sizeStock || [],
            image,
            images: images || [],
            colors: colors || [],
            materials: materials || [],
            sizes: sizes || [],
            inventory: inventory || [],
            discount: discount || 0,
            tags: tags || [],
            reviews: [],
            rating: 0,
            numReviews: 0
        });

        await product.save();
        // Invalidate products cache on create
        invalidateCache('/api/products');
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const {
            name, description, price, category, sizeStock, image,
            images, colors, materials, sizes, inventory, discount, tags
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Track stock changes for notifications
        const oldSizeStock = product.sizeStock || [];
        const newSizeStock = sizeStock || product.sizeStock;

        // Prepare update data
        const updateData = {
            name: name || product.name,
            description: description || product.description,
            price: price !== undefined ? price : product.price,
            category: category || product.category,
            sizeStock: newSizeStock,
            image: image || product.image,
            images: images !== undefined ? images : product.images,
            colors: colors !== undefined ? colors : product.colors,
            materials: materials !== undefined ? materials : product.materials,
            sizes: sizes !== undefined ? sizes : product.sizes,
            inventory: inventory !== undefined ? inventory : product.inventory,
            discount: discount !== undefined ? discount : product.discount,
            tags: tags !== undefined ? tags : product.tags
        };

        // Use findByIdAndUpdate to update
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Check for stock notifications (sizes that went from 0 to > 0)
        if (sizeStock) {
            const sizesNowInStock = [];
            for (const newSize of newSizeStock) {
                const oldSize = oldSizeStock.find(s => s.size === newSize.size);
                // Size now has stock but previously had 0 or didn't exist
                if (newSize.stock > 0 && (!oldSize || oldSize.stock === 0)) {
                    sizesNowInStock.push({ size: newSize.size, stock: newSize.stock });
                }
            }

            if (sizesNowInStock.length > 0) {
                // Send stock notifications asynchronously (don't wait)
                const { checkAndSendStockNotifications } = require('../services/stockNotificationService');
                checkAndSendStockNotifications(updatedProduct, sizesNowInStock)
                    .then(result => {
                        if (result.notified > 0) {
                            console.log(`Stock notifications sent: ${result.notified} users notified for ${updatedProduct.name}`);
                        }
                    })
                    .catch(err => console.error('Stock notification error:', err));
            }
        }

        // Invalidate cache on update
        invalidateCache('/api/products');
        res.json(updatedProduct);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        // Invalidate cache on delete
        invalidateCache('/api/products');
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/products/:id/reviews
// @desc    Create a product review (requires verified purchase)
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const alreadyReviewed = product.reviews.find(
            (review) => review.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Ya has dejado una reseña para este producto' });
        }

        // VERIFY PURCHASE: Check if user has purchased this product
        const Order = require('../models/Order');
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            'items.product': req.params.id,
            status: { $in: ['pagado', 'enviado', 'entregado'] } // Only completed orders
        });

        if (!hasPurchased) {
            return res.status(403).json({
                message: 'Solo puedes dejar reseñas de productos que hayas comprado'
            });
        }

        // Sanitize comment to prevent XSS
        const sanitizedComment = comment
            ? comment.replace(/<[^>]*>/g, '').trim()
            : '';

        // Create new review
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment: sanitizedComment,
            user: req.user._id,
            verifiedPurchase: true // Mark as verified purchase
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;

        // Calculate average rating
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Reseña añadida correctamente' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/:id/related
// @desc    Get related products (manual + automatic by category/tags)
// @access  Public
router.get('/:id/related', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let relatedProducts = [];

        // 1. First, get manually linked related products
        if (product.relatedProducts && product.relatedProducts.length > 0) {
            relatedProducts = await Product.find({
                _id: { $in: product.relatedProducts }
            }).limit(4);
        }

        // 2. If we need more, find by same category and tags
        if (relatedProducts.length < 4) {
            const remaining = 4 - relatedProducts.length;
            const excludeIds = [product._id, ...relatedProducts.map(p => p._id)];

            const autoRelated = await Product.find({
                _id: { $nin: excludeIds },
                $or: [
                    { category: product.category },
                    { tags: { $in: product.tags || [] } }
                ]
            })
                .sort({ rating: -1 })
                .limit(remaining);

            relatedProducts = [...relatedProducts, ...autoRelated];
        }

        // 3. If still need more, get random products from same category
        if (relatedProducts.length < 4) {
            const remaining = 4 - relatedProducts.length;
            const excludeIds = [product._id, ...relatedProducts.map(p => p._id)];

            const categoryProducts = await Product.find({
                _id: { $nin: excludeIds },
                category: product.category
            }).limit(remaining);

            relatedProducts = [...relatedProducts, ...categoryProducts];
        }

        res.json(relatedProducts);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/reviews/all
// @desc    Get all reviews from all products (for admin)
// @access  Private/Admin
router.get('/reviews/all', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({ 'reviews.0': { $exists: true } })
            .select('_id name reviews')
            .lean();

        // Flatten reviews with product info
        const allReviews = [];
        products.forEach(product => {
            product.reviews.forEach(review => {
                allReviews.push({
                    reviewId: review._id,
                    productId: product._id,
                    productName: product.name,
                    reviewerName: review.name,
                    userId: review.user,
                    rating: review.rating,
                    comment: review.comment,
                    verifiedPurchase: review.verifiedPurchase || false,
                    createdAt: review.createdAt
                });
            });
        });

        // Sort by date (newest first)
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allReviews);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/products/:productId/reviews/:reviewId
// @desc    Delete a review (admin only)
// @access  Private/Admin
router.delete('/:productId/reviews/:reviewId', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find and remove the review
        const reviewIndex = product.reviews.findIndex(
            review => review._id.toString() === req.params.reviewId
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }

        product.reviews.splice(reviewIndex, 1);
        product.numReviews = product.reviews.length;

        // Recalculate rating
        if (product.reviews.length > 0) {
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        } else {
            product.rating = 0;
        }

        await product.save();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

