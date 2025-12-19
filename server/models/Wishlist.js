const mongoose = require('mongoose');
const crypto = require('crypto');

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    lastPrice: {
        type: Number,
        default: null
    },
    notifyOnStock: {
        type: Boolean,
        default: true
    },
    preferredSize: {
        type: String,
        default: null
    }
});

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'Mi Lista',
        trim: true,
        maxlength: 50
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    shareToken: {
        type: String,
        unique: true,
        sparse: true
    },
    items: [wishlistItemSchema]
}, {
    timestamps: true
});

// Indexes for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ shareToken: 1 });
wishlistSchema.index({ 'items.product': 1 });

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function () {
    return this.items.length;
});

// Generate unique share token
wishlistSchema.methods.generateShareToken = function () {
    this.shareToken = crypto.randomBytes(16).toString('hex');
    return this.shareToken;
};

// Check if a product is in this wishlist
wishlistSchema.methods.hasProduct = function (productId) {
    return this.items.some(item => item.product.toString() === productId.toString());
};

// Static: Get default wishlist for user (create if not exists)
wishlistSchema.statics.getOrCreateDefault = async function (userId) {
    let wishlist = await this.findOne({ user: userId, name: 'Mi Lista' });
    if (!wishlist) {
        wishlist = await this.create({ user: userId, name: 'Mi Lista' });
    }
    return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
