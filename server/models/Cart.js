const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String, // Optional, for products with colors
    },
    material: {
        type: String, // Optional, for products with materials
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {  // Snapshot price at time of adding
        type: Number,
        required: true
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // One cart per user
    },
    items: [cartItemSchema],
    lastActive: {
        type: Date,
        default: Date.now,
        index: true  // For abandoned cart queries
    },
    isAbandoned: {
        type: Boolean,
        default: false,
        index: true
    },
    checkoutAttempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Update lastActive before each save
cartSchema.pre('save', function (next) {
    this.lastActive = new Date();
    if (typeof next === 'function') {
        next();
    }
});

// Virtual for cart total
cartSchema.virtual('total').get(function () {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Method to check if cart is abandoned (no activity for 24 hours)
cartSchema.methods.checkIfAbandoned = function () {
    const hoursSinceActive = (Date.now() - this.lastActive) / (1000 * 60 * 60);
    return hoursSinceActive >= 24 && this.items.length > 0;
};

// Enable virtuals in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
