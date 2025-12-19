require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const productsData = require('./data/products.json');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('Existing data cleared');

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@luxethread.com',
            password: '123456',
            role: 'admin'
        });
        console.log('✅ Admin user created:', adminUser.email);

        // Create regular user
        const regularUser = await User.create({
            name: 'Test User',
            email: 'user@luxethread.com',
            password: '123456',
            role: 'user'
        });
        console.log('✅ Regular user created:', regularUser.email);

        // Insert products
        const products = await Product.insertMany(productsData);
        console.log(`✅ ${products.length} products added successfully`);

        console.log('\n=== SEED COMPLETE ===');
        console.log('Admin credentials:');
        console.log('  Email: admin@luxethread.com');
        console.log('  Password: 123456');
        console.log('\nUser credentials:');
        console.log('  Email: user@luxethread.com');
        console.log('  Password: 123456');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
