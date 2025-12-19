require('dotenv').config();
const mongoose = require('mongoose');

const dropUserUniqueIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const db = mongoose.connection.db;
        const collection = db.collection('wishlists');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop the unique index on user field if it exists
        const userIndex = indexes.find(idx =>
            idx.key && idx.key.user === 1 && idx.unique === true
        );

        if (userIndex) {
            console.log(`\nDropping unique index: ${userIndex.name}`);
            await collection.dropIndex(userIndex.name);
            console.log('✅ Index dropped successfully');
        } else {
            console.log('\n✅ No unique user index found, nothing to drop');
        }

        // Also update existing wishlists that don't have a name
        const result = await collection.updateMany(
            { name: { $exists: false } },
            { $set: { name: 'Mi Lista' } }
        );
        console.log(`\n✅ Updated ${result.modifiedCount} wishlists with default name`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

dropUserUniqueIndex();
