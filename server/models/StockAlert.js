const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: {
        type: String,
        default: null // null means any size
    },
    email: {
        type: String,
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    },
    notifiedAt: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for user + product + size (unique alert per combination)
stockAlertSchema.index({ user: 1, product: 1, size: 1 }, { unique: true });
stockAlertSchema.index({ product: 1, active: 1, notified: 1 });

module.exports = mongoose.model('StockAlert', stockAlertSchema);
