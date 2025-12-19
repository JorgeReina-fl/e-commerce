const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Inventory Schema - Stock per color/material/size combination
const inventorySchema = new mongoose.Schema({
    color: {
        type: String,
        required: true
    },
    colorHex: {
        type: String,
        default: '#000000'
    },
    material: {
        type: String,
        default: 'Estándar'
    },
    size: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sku: {
        type: String,
        sparse: true
    }
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Hombre', 'Mujer', 'Niños', 'Accesorios']
    },
    // Main image (displayed in cards and as primary)
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    // Gallery images (additional photos)
    images: [{
        url: { type: String, required: true },
        alt: { type: String, default: '' }
    }],
    // Available colors for this product
    colors: [{
        name: { type: String, required: true },
        hex: { type: String, required: true },
        image: { type: String } // Optional: image showing product in this color
    }],
    // Available materials
    materials: [{
        type: String
    }],
    // Available sizes
    sizes: [{
        type: String
    }],
    // Inventory: stock per color/material/size combination
    inventory: [inventorySchema],
    // Legacy sizeStock for backward compatibility
    sizeStock: [{
        size: String,
        stock: { type: Number, default: 0 }
    }],
    // Discount percentage
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Tags for search and recommendations
    tags: [{ type: String, trim: true, lowercase: true }],
    reviews: {
        type: [reviewSchema],
        default: []
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0
    },
    // Inventory management settings
    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0
    },
    autoRestockEnabled: {
        type: Boolean,
        default: false
    },
    autoRestockLevel: {
        type: Number,
        default: 20,
        min: 0
    }
}, {
    timestamps: true
});

// Virtual for total stock across all inventory
productSchema.virtual('totalStock').get(function () {
    if (this.inventory && this.inventory.length > 0) {
        return this.inventory.reduce((total, item) => total + item.stock, 0);
    }
    // Fallback to sizeStock for backward compatibility
    if (this.sizeStock && this.sizeStock.length > 0) {
        return this.sizeStock.reduce((total, item) => total + item.stock, 0);
    }
    return 0;
});

// Virtual for available colors (colors with stock > 0)
productSchema.virtual('availableColors').get(function () {
    if (!this.inventory || this.inventory.length === 0) return [];
    const colorsWithStock = [...new Set(
        this.inventory.filter(inv => inv.stock > 0).map(inv => inv.color)
    )];
    return this.colors ? this.colors.filter(c => colorsWithStock.includes(c.name)) : [];
});

// Virtual for available sizes based on selection
productSchema.virtual('availableSizes').get(function () {
    if (this.inventory && this.inventory.length > 0) {
        return [...new Set(this.inventory.filter(inv => inv.stock > 0).map(inv => inv.size))];
    }
    if (this.sizeStock && this.sizeStock.length > 0) {
        return this.sizeStock.filter(item => item.stock > 0).map(item => item.size);
    }
    return [];
});

// Method to get stock for specific combination
productSchema.methods.getStock = function (color, material, size) {
    if (this.inventory && this.inventory.length > 0) {
        const item = this.inventory.find(inv =>
            inv.color === color &&
            inv.material === material &&
            inv.size === size
        );
        return item ? item.stock : 0;
    }
    // Fallback to sizeStock
    if (this.sizeStock) {
        const item = this.sizeStock.find(s => s.size === size);
        return item ? item.stock : 0;
    }
    return 0;
};

// Method to reduce stock
productSchema.methods.reduceStock = function (color, material, size, quantity) {
    if (this.inventory && this.inventory.length > 0) {
        const item = this.inventory.find(inv =>
            inv.color === color &&
            inv.material === material &&
            inv.size === size
        );
        if (item && item.stock >= quantity) {
            item.stock -= quantity;
            return true;
        }
        return false;
    }
    // Fallback to sizeStock
    if (this.sizeStock) {
        const item = this.sizeStock.find(s => s.size === size);
        if (item && item.stock >= quantity) {
            item.stock -= quantity;
            return true;
        }
    }
    return false;
};

// Enable virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Generate slug from name
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
        .replace(/^-|-$/g, ''); // Trim - from start/end
}

// Pre-save hook to generate slug
// Note: With async hooks in Mongoose 6+, next() is not needed
productSchema.pre('save', async function () {
    if (this.isModified('name') || !this.slug) {
        let baseSlug = generateSlug(this.name);
        let slug = baseSlug;
        let counter = 1;

        // Check for uniqueness
        while (true) {
            const existing = await mongoose.model('Product').findOne({
                slug,
                _id: { $ne: this._id }
            });
            if (!existing) break;
            slug = `${baseSlug}-${counter++}`;
        }

        this.slug = slug;
    }
});

module.exports = mongoose.model('Product', productSchema);
