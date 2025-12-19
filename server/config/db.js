const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        // Automatically use in-memory DB in test environments or CI if no URI is provided
        if (!uri && (process.env.NODE_ENV === 'test' || process.env.GITHUB_ACTIONS)) {
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                uri = mongoServer.getUri();
                console.log(`[TEST] Using in-memory MongoDB: ${uri}`);
            } catch (err) {
                console.warn('[TEST] Failed to start MongoMemoryServer, falling back to ENV');
            }
        }

        if (!uri) {
            throw new Error('MONGODB_URI is not defined. Please check your .env file.');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed if in CI/Test and DB is empty
        if (process.env.GITHUB_ACTIONS || process.env.NODE_ENV === 'test') {
            const Product = require('../models/Product');
            const count = await Product.countDocuments();
            if (count === 0) {
                console.log('[CI] Database is empty, seeding initial data...');
                try {
                    const productsDataRaw = require('../data/products.json');

                    // Map to new schema format (sizeStock)
                    const productsData = productsDataRaw.map(p => {
                        const sizeStock = [];
                        if (p.sizes && p.sizes.length > 0) {
                            const stockPerSize = Math.floor(p.stock / p.sizes.length);
                            const remainder = p.stock % p.sizes.length;
                            p.sizes.forEach((size, index) => {
                                sizeStock.push({
                                    size: size,
                                    stock: stockPerSize + (index === 0 ? remainder : 0)
                                });
                            });
                        }
                        return {
                            ...p,
                            sizeStock,
                            reviews: [],
                            rating: 0,
                            numReviews: 0,
                            // Ensure it has a valid category if enum is strict
                            category: ['Hombre', 'Mujer', 'Niños', 'Accesorios'].includes(p.category) ? p.category : 'Hombre'
                        };
                    });

                    await Product.insertMany(productsData);
                    console.log(`[CI] Seeded ${productsData.length} products successfully`);
                } catch (seedError) {
                    console.error('[CI] Error seeding initial data:', seedError.message);
                }
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
