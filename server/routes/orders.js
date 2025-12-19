const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { logStockMovement } = require('../services/inventoryService');
const { emitStockUpdate } = require('../services/socketService');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (simulated checkout)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { items, shippingAddress, user } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        // Calculate total and validate products
        let total = 0;
        const orderItems = [];
        const stockMovements = []; // Track movements to log after order is created

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            // Find the specific size stock
            const sizeStock = product.sizeStock.find(s => s.size === item.size);

            if (!sizeStock) {
                return res.status(400).json({
                    message: `Size ${item.size} not available for ${product.name}`
                });
            }

            if (sizeStock.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name} (Size ${item.size}). Available: ${sizeStock.stock}`
                });
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                size: item.size,
                price: product.price
            });

            total += product.price * item.quantity;

            // Calculate stock change for movement tracking
            const previousStock = sizeStock.stock;
            const newStock = previousStock - item.quantity;

            // Deduct stock for the specific size
            const sizeIndex = product.sizeStock.findIndex(s => s.size === item.size);
            if (sizeIndex !== -1) {
                product.sizeStock[sizeIndex].stock -= item.quantity;
                await product.save();

                // Emit real-time stock update via WebSocket
                emitStockUpdate(product._id.toString(), {
                    size: item.size,
                    stock: newStock,
                    previousStock,
                    type: 'venta',
                    productName: product.name
                });

                // Prepare movement data (will log after order is created)
                stockMovements.push({
                    productId: product._id,
                    type: 'venta',
                    quantity: -item.quantity,
                    previousStock,
                    newStock,
                    size: item.size,
                    reason: `Venta - Pedido`
                });
            }
        }

        // Create order
        // If user is provided (ID), use it, otherwise null (Guest)
        const orderData = {
            items: orderItems,
            total,
            status: 'pendiente',
            shippingAddress,
            email: req.body.email, // Save email for both guests and users
            phone: req.body.phone  // Save phone for order tracking
        };

        // Add coupon data if provided (already validated and usage incremented in payment flow)
        // SECURITY FIX: Validate coupon data against Stripe PaymentIntent metadata
        // to prevent client-side manipulation of discount amounts
        if (req.body.paymentIntentId) {
            try {
                const Stripe = require('stripe');
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

                // Retrieve the PaymentIntent from Stripe to get verified metadata
                const paymentIntent = await stripe.paymentIntents.retrieve(req.body.paymentIntentId);

                // SECURITY: Use Stripe metadata as source of truth, NOT client data
                if (paymentIntent.metadata.couponId) {
                    orderData.coupon = paymentIntent.metadata.couponId;
                    orderData.couponCode = paymentIntent.metadata.couponCode || null;
                    orderData.discountAmount = parseFloat(paymentIntent.metadata.discountAmount) || 0;
                    orderData.subtotal = parseFloat(paymentIntent.metadata.subtotal) || total;
                }

                // SECURITY: Verify the order total matches what Stripe charged
                const stripeChargedAmount = paymentIntent.amount / 100; // Convert from cents
                const calculatedTotal = orderData.subtotal
                    ? (orderData.subtotal - (orderData.discountAmount || 0))
                    : total;

                // Allow small floating point differences (up to 1 cent)
                if (Math.abs(stripeChargedAmount - calculatedTotal) > 0.01) {
                    console.warn(`[SECURITY] Total mismatch! Stripe: €${stripeChargedAmount}, Calculated: €${calculatedTotal}`);
                    // Use Stripe amount as the final truth
                    orderData.total = stripeChargedAmount;
                }

                orderData.paymentIntentId = req.body.paymentIntentId;
                orderData.paymentMethod = req.body.paymentMethod || 'Stripe';

            } catch (stripeError) {
                console.error('[SECURITY] Failed to verify PaymentIntent:', stripeError.message);
                // Don't fail the order, but log for investigation
            }
        }

        if (user && user !== 'Guest') {
            orderData.user = user;
            // If user logged in, ensure we have their email if not provided in body
            if (!orderData.email) {
                const userDoc = await User.findById(user);
                if (userDoc) orderData.email = userDoc.email;
            }
        }

        const order = new Order(orderData);
        await order.save();

        // Log stock movements now that we have the order ID
        for (const movement of stockMovements) {
            logStockMovement({
                ...movement,
                reason: `${movement.reason} #${order._id}`,
                orderId: order._id,
                userId: user && user !== 'Guest' ? user : null
            }).catch(err => console.error('Error logging stock movement:', err));
        }

        // Simulate payment processing delay
        setTimeout(async () => {
            order.status = 'pagado';
            await order.save();
        }, 2000);

        // Send confirmation email
        const recipientEmail = order.email;
        const recipientName = shippingAddress.name || 'Cliente';

        if (recipientEmail) {
            // Fetch full product details for email
            const productsWithDetails = await Promise.all(
                orderItems.map(async (item) => {
                    const product = await Product.findById(item.product);
                    return {
                        ...item,
                        productName: product?.name || 'Producto',
                        productImage: product?.image || ''
                    };
                })
            );

            const itemsList = productsWithDetails.map(item => `
                <tr>
                    <td style="padding: 10px;">
                        <img src="${item.productImage}" alt="${item.productName}" width="60" height="60" style="border-radius: 4px; object-fit: cover;" />
                    </td>
                    <td style="padding: 10px;">
                        <strong>${item.productName}</strong><br/>
                        <span style="color: #666;">Talla: ${item.size}</span>
                    </td>
                    <td style="padding: 10px; text-align: right;">
                        ${item.quantity} x €${item.price}
                    </td>
                    <td style="padding: 10px; text-align: right;">
                        <strong>€${(item.quantity * item.price).toFixed(2)}</strong>
                    </td>
                </tr>
            `).join('');

            const message = `
                <h2>¡Gracias por tu pedido!</h2>
                <p>Hola ${recipientName},</p>
                <p>Hemos recibido tu pedido correctamente. Aquí tienes el resumen:</p>
                <h3>Pedido #${order._id}</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="border-bottom: 2px solid #ddd;">
                            <th style="padding: 10px; text-align: left;">Imagen</th>
                            <th style="padding: 10px; text-align: left;">Producto</th>
                            <th style="padding: 10px; text-align: right;">Cantidad</th>
                            <th style="padding: 10px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                </table>
                <p><strong>Total: €${total}</strong></p>
                <p><strong>Dirección de envío:</strong><br>
                ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}</p>
                <p>Te notificaremos cuando tu pedido sea enviado.</p>
            `;

            try {
                await sendEmail({
                    to: recipientEmail,
                    subject: `Confirmación de Pedido #${order._id}`,
                    htmlContent: message
                });
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }

        res.status(201).json({
            message: 'Order created successfully',
            orderId: order._id,
            total: order.total
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/orders/track
// @desc    Track order for guest users using orderID + email or phone
// @access  Public
router.post('/track', async (req, res) => {
    try {
        const { orderId, email, phone } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Número de pedido es requerido' });
        }

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email o teléfono es requerido' });
        }

        // Build query - search by orderId AND (email OR phone)
        const query = { _id: orderId };

        const order = await Order.findOne(query)
            .populate('items.product', 'name image price')
            .lean();

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Verify email or phone matches
        const emailMatch = email && order.email.toLowerCase() === email.toLowerCase();
        const phoneMatch = phone && order.phone === phone;

        if (!emailMatch && !phoneMatch) {
            return res.status(401).json({ message: 'Los datos proporcionados no coinciden con el pedido' });
        }

        // Return order safely with null product handling
        const safeOrder = {
            ...order,
            items: order.items.map(item => ({
                ...item,
                product: item.product || { name: 'Producto eliminado', image: '', price: item.price }
            }))
        };

        res.json(safeOrder);
    } catch (error) {
        console.error('Error tracking order:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Formato de número de pedido inválido' });
        }
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics for analytics dashboard
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Aggregation pipeline for sales by day (last  7 days)
        const salesByDay = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalSales: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalSales: 1,
                    orderCount: 1
                }
            }
        ]);

        // Total sales (all time)
        const totalSalesResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" }
                }
            }
        ]);
        const totalRevenue = totalSalesResult.length > 0 ? totalSalesResult[0].totalRevenue : 0;

        // Total orders count
        const totalOrders = await Order.countDocuments();

        // Total products sold (sum of all quantities from all orders)
        const totalProductsResult = await Order.aggregate([
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: "$items.quantity" }
                }
            }
        ]);
        const totalProducts = totalProductsResult.length > 0 ? totalProductsResult[0].totalProducts : 0;

        // Total users count
        const totalUsers = await User.countDocuments();

        // Ensure we have data for all 7 days (fill missing days with 0)
        const filledSalesByDay = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const existingData = salesByDay.find(d => d.date === dateStr);
            filledSalesByDay.push({
                date: dateStr,
                totalSales: existingData ? existingData.totalSales : 0,
                orderCount: existingData ? existingData.orderCount : 0
            });
        }

        res.json({
            salesByDay: filledSalesByDay,
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public for guest orders, Private for user orders
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name image price')
            .lean();

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If order has no user (guest order), allow public access
        if (!order.user) {
            // Handle null products in items
            const safeOrder = {
                ...order,
                items: order.items.map(item => ({
                    ...item,
                    product: item.product || { name: 'Producto eliminado', image: '', price: item.price }
                }))
            };
            return res.json(safeOrder);
        }

        // For orders with users, require authentication
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const User = require('../models/User');
            const requestUser = await User.findById(decoded.id);

            if (!requestUser) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if order belongs to user or user is admin
            if (order.user._id.toString() !== requestUser._id.toString() && requestUser.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to view this order' });
            }

            // Handle null products in items
            const safeOrder = {
                ...order,
                items: order.items.map(item => ({
                    ...item,
                    product: item.product || { name: 'Producto eliminado', image: '', price: item.price }
                }))
            };

            res.json(safeOrder);
        } catch (tokenError) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } catch (error) {
        console.error('Error fetching order:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        console.log('Fetching all orders...');

        // Use lean() to get plain JavaScript objects instead of Mongoose documents
        const orders = await Order.find({})
            .populate('user', 'id name')
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`Found ${orders.length} orders`);

        // Safely handle orders with deleted products
        const safeOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                product: item.product || { name: 'Producto eliminado', image: '' }
            }))
        }));

        res.json(safeOrders);
    } catch (error) {
        console.error('Error in GET /api/orders:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        console.log('Marking order as delivered:', req.params.id);
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'enviado';
        await order.save();

        // Get recipient email - could be from user or from order.email (guest)
        let recipientEmail = order.email;
        let recipientName = order.shippingAddress?.name || 'Cliente';

        // If there's a user, try to get their info
        if (order.user) {
            try {
                const user = await User.findById(order.user);
                if (user) {
                    recipientEmail = user.email;
                    recipientName = user.name;
                }
            } catch (e) {
                console.log('Could not fetch user for email:', e.message);
            }
        }

        // Send shipping email
        if (recipientEmail) {
            const message = `
                <h2>¡Tu pedido ha sido enviado!</h2>
                <p>Hola ${recipientName},</p>
                <p>Tu pedido #${order._id} ha salido de nuestro almacén y está en camino.</p>
                <p>Gracias por comprar en LuxeThread.</p>
            `;

            try {
                await sendEmail({
                    to: recipientEmail,
                    subject: '¡Tu pedido LuxeThread ha sido enviado!',
                    htmlContent: message
                });
            } catch (emailError) {
                console.error('Error sending shipping email:', emailError.message);
            }
        }

        // Return the updated order as plain object
        const updatedOrder = await Order.findById(order._id).lean();
        res.json(updatedOrder);

    } catch (error) {
        console.error('Error in deliver route:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
