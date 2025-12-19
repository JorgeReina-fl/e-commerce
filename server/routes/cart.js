const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Helper function to get available stock for a size
// Helper function to get available stock for a size/color/material
const getAvailableStock = async (productId, size, color, material) => {
    const product = await Product.findById(productId);
    if (!product) return 0;

    // Check strict inventory first if color/material provided
    if (product.inventory && product.inventory.length > 0 && color && material) {
        const variant = product.inventory.find(
            i => i.size === size && i.color === color && i.material === material
        );
        return variant ? variant.stock : 0;
    }

    // Fallback to sizeStock
    const sizeStock = product.sizeStock.find(s => s.size === size);
    if (!sizeStock) return 0;

    return sizeStock.stock;
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price image category sizeStock');

        if (!cart) {
            cart = { user: req.user._id, items: [], total: 0, itemCount: 0 };
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/cart/sync
// @desc    Sync localStorage cart with DB on login
// @access  Private
router.post('/sync', protect, async (req, res) => {
    try {
        const { localItems } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Merge logic with stock validation
        if (localItems && localItems.length > 0) {
            for (const localItem of localItems) {
                // Validate product exists
                const product = await Product.findById(localItem.productId);
                if (!product) continue;

                // Check available stock for variant
                const availableStock = await getAvailableStock(
                    localItem.productId,
                    localItem.size,
                    localItem.color,     // Now supported
                    localItem.material   // Now supported
                );

                if (availableStock <= 0) continue;

                const exists = cart.items.find(
                    item => item.product.toString() === localItem.productId
                        && item.size === localItem.size
                        && item.color === localItem.color       // Match variant
                        && item.material === localItem.material // Match variant
                );

                if (!exists) {
                    // Limit quantity to available stock
                    const validQuantity = Math.min(localItem.quantity, availableStock);
                    if (validQuantity > 0) {
                        cart.items.push({
                            product: localItem.productId,
                            size: localItem.size,
                            color: localItem.color,
                            material: localItem.material,
                            quantity: validQuantity,
                            price: product.price
                        });
                    }
                } else {
                    // Merge quantities, but cap at available stock
                    const newQuantity = exists.quantity + localItem.quantity;
                    exists.quantity = Math.min(newQuantity, availableStock);
                }
            }

            await cart.save();
        }

        await cart.populate('items.product', 'name price image category sizeStock');
        res.json(cart);
    } catch (error) {
        console.error('Cart sync error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', protect, async (req, res) => {
    try {
        const { productId, size, quantity = 1, color, material } = req.body;

        if (!size) {
            return res.status(400).json({ message: 'Size is required' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be positive' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock for specific available variant
        const availableStock = await getAvailableStock(productId, size, color, material);
        if (availableStock === 0) {
            return res.status(400).json({ message: 'Selected combination not available' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
                && item.size === size
                && item.color === color
                && item.material === material
        );

        // Calculate total quantity after adding
        let currentQuantity = 0;
        if (existingItemIndex > -1) {
            currentQuantity = cart.items[existingItemIndex].quantity;
        }
        const newTotalQuantity = currentQuantity + quantity;

        // SECURITY: Validate against available stock
        if (newTotalQuantity > availableStock) {
            const availableToAdd = availableStock - currentQuantity;
            if (availableToAdd <= 0) {
                return res.status(400).json({
                    message: `Stock insuficiente. Ya tienes ${currentQuantity} en el carrito y solo hay ${availableStock} disponibles.`,
                    availableStock: availableStock,
                    currentInCart: currentQuantity
                });
            }
            return res.status(400).json({
                message: `Solo puedes añadir ${availableToAdd} unidades más. Stock disponible: ${availableStock}`,
                availableStock: availableStock,
                currentInCart: currentQuantity,
                canAdd: availableToAdd
            });
        }

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity = newTotalQuantity;
        } else {
            cart.items.push({
                product: productId,
                size,
                color,
                material,
                quantity,
                price: product.price
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name price image category sizeStock');

        res.json(cart);
    } catch (error) {
        console.error('Add to cart error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/cart/items/:index
// @desc    Update cart item quantity
// @access  Private
router.put('/items/:index', protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        const index = parseInt(req.params.index);

        if (isNaN(index) || index < 0) {
            return res.status(400).json({ message: 'Invalid item index' });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || !cart.items[index]) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (quantity <= 0) {
            cart.items.splice(index, 1);
        } else {
            // SECURITY: Validate against available stock
            const cartItem = cart.items[index];
            const product = await Product.findById(cartItem.product);

            if (!product) {
                // Product was deleted, remove from cart
                cart.items.splice(index, 1);
            } else {
                const availableStock = await getAvailableStock(
                    cartItem.product,
                    cartItem.size,
                    cartItem.color,
                    cartItem.material
                );

                if (quantity > availableStock) {
                    return res.status(400).json({
                        message: `Solo hay ${availableStock} unidades disponibles`,
                        availableStock,
                        requestedQuantity: quantity
                    });
                }

                cart.items[index].quantity = quantity;
            }
        }

        await cart.save();
        await cart.populate('items.product', 'name price image category sizeStock');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/cart/items/:index
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:index', protect, async (req, res) => {
    try {
        const index = parseInt(req.params.index);

        if (isNaN(index) || index < 0) {
            return res.status(400).json({ message: 'Invalid item index' });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (!cart.items[index]) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cart.items.splice(index, 1);
        await cart.save();
        await cart.populate('items.product', 'name price image category sizeStock');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/cart/validate
// @desc    Validate cart items have sufficient stock before checkout
// @access  Private
router.post('/validate', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price sizeStock inventory'); // Populate inventory too

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const issues = [];
        const validItems = [];

        for (const item of cart.items) {
            if (!item.product) {
                issues.push({
                    type: 'deleted',
                    message: 'Producto ya no disponible',
                    itemIndex: cart.items.indexOf(item)
                });
                continue;
            }

            const availableStock = await getAvailableStock(
                item.product._id,
                item.size,
                item.color,
                item.material
            );

            if (availableStock === 0) {
                issues.push({
                    type: 'out_of_stock',
                    productName: item.product.name,
                    size: item.size,
                    color: item.color,
                    material: item.material,
                    message: `${item.product.name} (${item.size}${item.color ? ', ' + item.color : ''}) está agotado`,
                    itemIndex: cart.items.indexOf(item)
                });
            } else if (item.quantity > availableStock) {
                issues.push({
                    type: 'insufficient_stock',
                    productName: item.product.name,
                    size: item.size,
                    color: item.color,
                    material: item.material,
                    requested: item.quantity,
                    available: availableStock,
                    message: `${item.product.name} (${item.size}): solo quedan ${availableStock} unidades`,
                    itemIndex: cart.items.indexOf(item)
                });
            } else {
                validItems.push(item);
            }
        }

        res.json({
            valid: issues.length === 0,
            issues,
            validItemsCount: validItems.length,
            totalItems: cart.items.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
