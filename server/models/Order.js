const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    email: {
        type: String,
        required: [true, 'Email is required for order confirmation'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required for order tracking']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        size: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: [true, 'Order total is required'],
        min: [0, 'Total cannot be negative']
    },
    status: {
        type: String,
        enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'reembolsado'],
        default: 'pendiente'
    },
    paymentIntentId: {
        type: String
    },
    paymentMethod: {
        type: String,
        default: 'Stripe'
    },
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    // Coupon applied to this order (only ONE coupon allowed per order)
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },
    // Discount amount applied (locked at time of order)
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Discount amount cannot be negative']
    },
    // Subtotal before discount (for audit trail)
    subtotal: {
        type: Number,
        default: null
    },
    // Coupon code used (stored for reference even if coupon is deleted)
    couponCode: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
