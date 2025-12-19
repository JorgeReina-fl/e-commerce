require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Cambia este email por el que usaste al registrarte
        const email = 'admin@test.com';

        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log('✅ Usuario convertido a admin:', user.email);
            console.log('   Nombre:', user.name);
            console.log('   Rol:', user.role);
        } else {
            console.log('❌ Usuario no encontrado con email:', email);
            console.log('\nUsuarios disponibles:');
            const users = await User.find({}, 'email name role');
            users.forEach(u => {
                console.log(`  - ${u.email} (${u.role})`);
            });
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

makeAdmin();
