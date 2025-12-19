// Script to generate slugs for existing products
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

async function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function migrateSlug() {
    await connectDB();

    const products = await Product.find({ slug: { $exists: false } });
    console.log(`Found ${products.length} products without slug`);

    for (const product of products) {
        let baseSlug = await generateSlug(product.name);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await Product.findOne({ slug, _id: { $ne: product._id } });
            if (!existing) break;
            slug = `${baseSlug}-${counter++}`;
        }

        product.slug = slug;
        await product.save();
        console.log(`Updated: ${product.name} -> ${slug}`);
    }

    console.log('Migration complete!');
    process.exit(0);
}

migrateSlug().catch(console.error);
