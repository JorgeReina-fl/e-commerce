/**
 * Jest Test Setup - MongoMemoryServer
 * 
 * Creates an in-memory MongoDB instance for isolated testing.
 * Each test file gets a clean database.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Increase timeout for MongoDB setup
jest.setTimeout(30000);

/**
 * Before all tests: Start MongoMemoryServer and connect
 */
beforeAll(async () => {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory DB
    await mongoose.connect(mongoUri);

    console.log('[TEST] Connected to in-memory MongoDB');
});

/**
 * After each test: Clean all collections
 */
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

/**
 * After all tests: Disconnect and stop server
 */
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
    console.log('[TEST] MongoDB disconnected and stopped');
});

// Export for use in tests
module.exports = { mongoServer };
