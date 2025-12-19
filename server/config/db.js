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
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
