require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
const fs = require('fs');

const testAuth = async () => {
    try {
        console.log('1. Connecting to DB...');
        await connectDB();
        console.log('2. DB Connected.');

        const testEmail = 'test_debug_' + Date.now() + '@example.com';
        console.log(`3. Attempting to create user with email: ${testEmail}`);

        const user = new User({
            name: 'Debug User',
            email: testEmail,
            password: 'password123',
            role: 'user'
        });

        console.log('4. User instance created. Saving...');
        await user.save();
        console.log('5. User saved successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR in testAuth:');
        console.error(error);
        fs.writeFileSync('error.log', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exit(1);
    }
};

testAuth();
