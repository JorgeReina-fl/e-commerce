require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const migrateProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all products with old schema
        const products = await Product.find({}).lean();
        console.log(`Found ${products.length} products to migrate`);

        for (const product of products) {
            // Check if already migrated (has sizeStock field)
            if (product.sizeStock && product.sizeStock.length > 0) {
                console.log(`Product "${product.name}" already migrated, skipping...`);
                continue;
            }

            // Convert old format to new format
            const sizeStock = [];

            if (product.sizes && product.sizes.length > 0) {
                // Distribute stock evenly across sizes
                const stockPerSize = Math.floor(product.stock / product.sizes.length);
                const remainder = product.stock % product.sizes.length;

                product.sizes.forEach((size, index) => {
                    sizeStock.push({
                        size: size,
                        stock: stockPerSize + (index === 0 ? remainder : 0)
                    });
                });
            }

            // Update product with new schema
            await Product.findByIdAndUpdate(product._id, {
                $set: {
                    sizeStock: sizeStock,
                    reviews: [],
                    rating: 0,
                    numReviews: 0
                },
                $unset: {
                    sizes: 1,
                    stock: 1
                }
            });

            console.log(`✓ Migrated product: ${product.name}`);
        }

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateProducts();
