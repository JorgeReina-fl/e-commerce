const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    // Unique coupon code (auto-converted to uppercase)
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [3, 'Coupon code must be at least 3 characters'],
        maxlength: [20, 'Coupon code cannot exceed 20 characters']
    },

    // Type of discount
    type: {
        type: String,
        enum: {
            values: ['PERCENTAGE', 'FIXED_AMOUNT'],
            message: 'Type must be either PERCENTAGE or FIXED_AMOUNT'
        },
        required: [true, 'Discount type is required']
    },

    // Discount value (percentage or fixed amount in EUR)
    value: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative']
    },

    // Minimum cart total required to apply coupon (optional)
    minPurchaseAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase amount cannot be negative']
    },

    // Coupon expiration date
    expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required']
    },

    // Maximum number of times this coupon can be used globally
    maxUses: {
        type: Number,
        required: [true, 'Maximum uses is required'],
        min: [1, 'Maximum uses must be at least 1']
    },

    // Current usage count (incremented atomically on each use)
    usedCount: {
        type: Number,
        default: 0,
        min: [0, 'Used count cannot be negative']
    },

    // Whether the coupon is currently active
    isActive: {
        type: Boolean,
        default: true
    },

    // Optional: Maximum discount amount (cap for percentage discounts)
    maxDiscountAmount: {
        type: Number,
        default: null
    },

    // Optional: Description for admin reference
    description: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    }
}, {
    timestamps: true
});

// Index for fast code lookups
couponSchema.index({ code: 1 });

// Validation: Percentage cannot exceed 100%
couponSchema.pre('save', function () {
    if (this.type === 'PERCENTAGE' && this.value > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
    }
});

// Static method to validate and get coupon details
// Returns coupon if valid, throws error if invalid
couponSchema.statics.validateCoupon = async function (code, cartTotal) {
    const coupon = await this.findOne({
        code: code.toUpperCase(),
        isActive: true
    });

    if (!coupon) {
        throw new Error('Cupón no encontrado o inactivo');
    }

    // Check expiration
    if (new Date() > coupon.expirationDate) {
        throw new Error('Este cupón ha expirado');
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.maxUses) {
        throw new Error('Este cupón ha alcanzado su límite de usos');
    }

    // Check minimum purchase
    if (cartTotal < coupon.minPurchaseAmount) {
        throw new Error(`El total del carrito debe ser mínimo €${coupon.minPurchaseAmount} para usar este cupón`);
    }

    return coupon;
};

// Static method to calculate discount amount
couponSchema.statics.calculateDiscount = function (coupon, cartTotal) {
    let discountAmount = 0;

    if (coupon.type === 'PERCENTAGE') {
        discountAmount = (cartTotal * coupon.value) / 100;

        // Apply max discount cap if set
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    } else {
        // FIXED_AMOUNT
        discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimals
};

// Static method to atomically increment usage count
// Uses findOneAndUpdate with conditions to prevent race conditions
// Returns null if coupon can't be used (already at max)
couponSchema.statics.incrementUsage = async function (couponId) {
    const result = await this.findOneAndUpdate(
        {
            _id: couponId,
            isActive: true,
            $expr: { $lt: ['$usedCount', '$maxUses'] } // usedCount < maxUses
        },
        {
            $inc: { usedCount: 1 }
        },
        {
            new: true // Return updated document
        }
    );

    return result; // Returns null if conditions not met (coupon already maxed out)
};

module.exports = mongoose.model('Coupon', couponSchema);
