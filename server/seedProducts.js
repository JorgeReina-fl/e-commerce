require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Product data templates
const colors = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Azul Marino', hex: '#1E3A5F' },
    { name: 'Gris', hex: '#6B7280' },
    { name: 'Rojo', hex: '#DC2626' },
    { name: 'Verde', hex: '#059669' },
    { name: 'Beige', hex: '#D4B896' },
    { name: 'Marrón', hex: '#78350F' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Azul Claro', hex: '#60A5FA' }
];

const materials = ['Algodón', 'Poliéster', 'Lino', 'Seda', 'Lana', 'Denim', 'Cuero'];

const sizesClothing = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const sizesShoes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const sizesAccessories = ['Único'];

// Image placeholders (fashion themed)
const getProductImages = (category, index) => {
    const baseUrls = [
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
        'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
        'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'
    ];

    const categoryImages = {
        'Hombre': [
            'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
            'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800',
            'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800'
        ],
        'Mujer': [
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
            'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
            'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'
        ],
        'Niños': [
            'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800',
            'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800',
            'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
            'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800',
            'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'
        ],
        'Accesorios': [
            'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'
        ]
    };

    const imgs = categoryImages[category] || baseUrls;
    return {
        main: imgs[index % imgs.length],
        gallery: imgs.slice(0, 3).map(url => ({ url, alt: '' }))
    };
};

// Generate inventory for a product
const generateInventory = (productColors, productMaterials, productSizes) => {
    const inventory = [];

    productColors.forEach(color => {
        productMaterials.forEach(material => {
            productSizes.forEach(size => {
                inventory.push({
                    color: color.name,
                    colorHex: color.hex,
                    material,
                    size,
                    stock: Math.floor(Math.random() * 20) + 1, // 1-20 stock
                    sku: `SKU-${color.name.substring(0, 2).toUpperCase()}-${material.substring(0, 2).toUpperCase()}-${size}`
                });
            });
        });
    });

    return inventory;
};

// Generate sizeStock for backward compatibility
const generateSizeStock = (sizes, inventory) => {
    return sizes.map(size => ({
        size,
        stock: inventory.filter(i => i.size === size).reduce((sum, i) => sum + i.stock, 0)
    }));
};

// Products data
const productsData = [
    // HOMBRE (10 productos)
    {
        name: 'Camiseta Premium Algodón',
        description: 'Camiseta de algodón 100% orgánico con corte clásico. Perfecta para el uso diario con un acabado suave y duradero.',
        price: 29.99,
        category: 'Hombre',
        colors: [colors[0], colors[1], colors[2], colors[3]],
        materials: ['Algodón', 'Algodón Orgánico'],
        sizes: sizesClothing,
        tags: ['camiseta', 'casual', 'básico', 'algodón']
    },
    {
        name: 'Camisa Oxford Slim Fit',
        description: 'Camisa Oxford de corte slim con botones de nácar. Ideal para ocasiones formales y casuales.',
        price: 59.99,
        category: 'Hombre',
        colors: [colors[1], colors[4], colors[9]],
        materials: ['Algodón', 'Lino'],
        sizes: sizesClothing,
        tags: ['camisa', 'formal', 'oxford', 'slim']
    },
    {
        name: 'Pantalón Chino Classic',
        description: 'Pantalón chino de corte regular con tejido resistente. Comodidad y estilo para cualquier ocasión.',
        price: 49.99,
        category: 'Hombre',
        colors: [colors[0], colors[6], colors[7], colors[3]],
        materials: ['Algodón', 'Poliéster'],
        sizes: sizesClothing,
        tags: ['pantalón', 'chino', 'casual', 'clásico']
    },
    {
        name: 'Blazer Casual Moderno',
        description: 'Blazer de corte moderno con bolsillos funcionales. Perfecto para looks smart-casual.',
        price: 129.99,
        category: 'Hombre',
        colors: [colors[0], colors[2], colors[3]],
        materials: ['Lana', 'Poliéster'],
        sizes: sizesClothing,
        tags: ['blazer', 'formal', 'elegante', 'moderno']
    },
    {
        name: 'Polo Deportivo Premium',
        description: 'Polo con tejido transpirable y acabado antibacteriano. Ideal para deportes y uso casual.',
        price: 44.99,
        category: 'Hombre',
        colors: [colors[0], colors[1], colors[2], colors[5]],
        materials: ['Poliéster', 'Algodón'],
        sizes: sizesClothing,
        tags: ['polo', 'deportivo', 'transpirable', 'premium']
    },
    {
        name: 'Jeans Slim Stretch',
        description: 'Jeans de corte slim con elastano para mayor comodidad. Lavado moderno y duradero.',
        price: 69.99,
        category: 'Hombre',
        colors: [colors[2], colors[0], colors[3]],
        materials: ['Denim'],
        sizes: sizesClothing,
        tags: ['jeans', 'denim', 'slim', 'stretch']
    },
    {
        name: 'Sudadera con Capucha',
        description: 'Sudadera de algodón french terry con capucha ajustable y bolsillo canguro.',
        price: 54.99,
        category: 'Hombre',
        colors: [colors[0], colors[3], colors[2], colors[1]],
        materials: ['Algodón', 'Poliéster'],
        sizes: sizesClothing,
        tags: ['sudadera', 'casual', 'capucha', 'cómodo']
    },
    {
        name: 'Abrigo Lana Elegante',
        description: 'Abrigo largo de lana con forro interior. Elegancia y calidez para el invierno.',
        price: 189.99,
        category: 'Hombre',
        colors: [colors[0], colors[7], colors[3]],
        materials: ['Lana'],
        sizes: sizesClothing,
        tags: ['abrigo', 'lana', 'invierno', 'elegante']
    },
    {
        name: 'Bermuda Casual Verano',
        description: 'Bermuda de algodón ligero con bolsillos laterales. Perfecta para el verano.',
        price: 34.99,
        category: 'Hombre',
        colors: [colors[6], colors[2], colors[5], colors[0]],
        materials: ['Algodón', 'Lino'],
        sizes: sizesClothing,
        tags: ['bermuda', 'verano', 'casual', 'ligero']
    },
    {
        name: 'Jersey Cuello Redondo',
        description: 'Jersey de punto fino con cuello redondo. Tejido suave ideal para entretiempo.',
        price: 64.99,
        category: 'Hombre',
        colors: [colors[3], colors[2], colors[7], colors[0]],
        materials: ['Lana', 'Algodón'],
        sizes: sizesClothing,
        tags: ['jersey', 'punto', 'invierno', 'suave']
    },

    // MUJER (10 productos)
    {
        name: 'Vestido Midi Elegante',
        description: 'Vestido midi con escote en V y cintura marcada. Perfecto para eventos especiales.',
        price: 89.99,
        category: 'Mujer',
        colors: [colors[0], colors[4], colors[5], colors[8]],
        materials: ['Seda', 'Poliéster'],
        sizes: sizesClothing,
        tags: ['vestido', 'elegante', 'midi', 'evento']
    },
    {
        name: 'Blusa Romántica Volantes',
        description: 'Blusa con volantes y mangas abullonadas. Toque romántico para cualquier look.',
        price: 49.99,
        category: 'Mujer',
        colors: [colors[1], colors[8], colors[9]],
        materials: ['Algodón', 'Seda'],
        sizes: sizesClothing,
        tags: ['blusa', 'romántica', 'volantes', 'femenino']
    },
    {
        name: 'Falda Plisada Midi',
        description: 'Falda plisada de largo midi con cintura elástica. Elegancia y comodidad.',
        price: 54.99,
        category: 'Mujer',
        colors: [colors[0], colors[6], colors[2], colors[8]],
        materials: ['Poliéster'],
        sizes: sizesClothing,
        tags: ['falda', 'plisada', 'midi', 'elegante']
    },
    {
        name: 'Pantalón Palazzo Fluido',
        description: 'Pantalón palazzo de corte amplio y tejido fluido. Máxima comodidad con estilo.',
        price: 59.99,
        category: 'Mujer',
        colors: [colors[0], colors[1], colors[6]],
        materials: ['Lino', 'Poliéster'],
        sizes: sizesClothing,
        tags: ['pantalón', 'palazzo', 'fluido', 'cómodo']
    },
    {
        name: 'Chaqueta Cuero Biker',
        description: 'Chaqueta de cuero estilo biker con cremalleras metálicas. Rock and roll attitude.',
        price: 159.99,
        category: 'Mujer',
        colors: [colors[0], colors[7]],
        materials: ['Cuero'],
        sizes: sizesClothing,
        tags: ['chaqueta', 'cuero', 'biker', 'rock']
    },
    {
        name: 'Top Crop Deportivo',
        description: 'Top crop con sujetador integrado y tejido transpirable. Ideal para yoga y fitness.',
        price: 34.99,
        category: 'Mujer',
        colors: [colors[0], colors[8], colors[5], colors[1]],
        materials: ['Poliéster', 'Algodón'],
        sizes: sizesClothing,
        tags: ['top', 'deportivo', 'yoga', 'fitness']
    },
    {
        name: 'Cardigan Oversize',
        description: 'Cardigan oversize de punto grueso con botones grandes. Calidez y estilo casual.',
        price: 74.99,
        category: 'Mujer',
        colors: [colors[6], colors[3], colors[1]],
        materials: ['Lana', 'Algodón'],
        sizes: sizesClothing,
        tags: ['cardigan', 'oversize', 'punto', 'cálido']
    },
    {
        name: 'Mono Largo Elegante',
        description: 'Mono largo con escote halter y espalda descubierta. Sofisticación para noches especiales.',
        price: 99.99,
        category: 'Mujer',
        colors: [colors[0], colors[4], colors[2]],
        materials: ['Poliéster', 'Seda'],
        sizes: sizesClothing,
        tags: ['mono', 'elegante', 'noche', 'halter']
    },
    {
        name: 'Shorts Denim Vintage',
        description: 'Shorts denim con lavado vintage y dobladillo deshilachado. Estilo retro moderno.',
        price: 39.99,
        category: 'Mujer',
        colors: [colors[9], colors[0]],
        materials: ['Denim'],
        sizes: sizesClothing,
        tags: ['shorts', 'denim', 'vintage', 'verano']
    },
    {
        name: 'Camiseta Básica Esencial',
        description: 'Camiseta básica de algodón pima con corte femenino. Esencial en cualquier armario.',
        price: 24.99,
        category: 'Mujer',
        colors: [colors[0], colors[1], colors[3], colors[8], colors[5]],
        materials: ['Algodón'],
        sizes: sizesClothing,
        tags: ['camiseta', 'básica', 'algodón', 'esencial']
    },

    // NIÑOS (5 productos)
    {
        name: 'Camiseta Dinosaurio',
        description: 'Camiseta divertida con estampado de dinosaurios. Algodón suave para pieles sensibles.',
        price: 19.99,
        category: 'Niños',
        colors: [colors[5], colors[9], colors[3]],
        materials: ['Algodón'],
        sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12-13'],
        tags: ['camiseta', 'niños', 'dinosaurio', 'divertido']
    },
    {
        name: 'Pantalón Jogger Kids',
        description: 'Pantalón jogger con cintura elástica y puños ajustados. Comodidad para jugar.',
        price: 29.99,
        category: 'Niños',
        colors: [colors[0], colors[3], colors[2]],
        materials: ['Algodón', 'Poliéster'],
        sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12-13'],
        tags: ['pantalón', 'jogger', 'niños', 'cómodo']
    },
    {
        name: 'Vestido Princesa',
        description: 'Vestido con tul y detalles brillantes. Haz realidad sus sueños de princesa.',
        price: 44.99,
        category: 'Niños',
        colors: [colors[8], colors[1], colors[9]],
        materials: ['Poliéster', 'Algodón'],
        sizes: ['2-3', '4-5', '6-7', '8-9', '10-11'],
        tags: ['vestido', 'niñas', 'princesa', 'fiesta']
    },
    {
        name: 'Sudadera Superhéroe',
        description: 'Sudadera con capucha y estampado de superhéroe. Para pequeños valientes.',
        price: 34.99,
        category: 'Niños',
        colors: [colors[4], colors[2], colors[0]],
        materials: ['Algodón', 'Poliéster'],
        sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12-13'],
        tags: ['sudadera', 'superhéroe', 'niños', 'capucha']
    },
    {
        name: 'Conjunto Deportivo Junior',
        description: 'Conjunto de camiseta y pantalón corto para deporte. Tejido transpirable.',
        price: 39.99,
        category: 'Niños',
        colors: [colors[0], colors[2], colors[4]],
        materials: ['Poliéster'],
        sizes: ['4-5', '6-7', '8-9', '10-11', '12-13'],
        tags: ['conjunto', 'deportivo', 'niños', 'transpirable']
    },

    // ACCESORIOS (5 productos)
    {
        name: 'Bolso Tote Premium',
        description: 'Bolso tote de cuero genuino con compartimentos interiores. Elegancia funcional.',
        price: 129.99,
        category: 'Accesorios',
        colors: [colors[0], colors[7], colors[6]],
        materials: ['Cuero'],
        sizes: sizesAccessories,
        tags: ['bolso', 'tote', 'cuero', 'elegante']
    },
    {
        name: 'Cinturón Cuero Clásico',
        description: 'Cinturón de cuero con hebilla metálica pulida. Un básico imprescindible.',
        price: 49.99,
        category: 'Accesorios',
        colors: [colors[0], colors[7]],
        materials: ['Cuero'],
        sizes: ['85', '90', '95', '100', '105', '110'],
        tags: ['cinturón', 'cuero', 'clásico', 'básico']
    },
    {
        name: 'Bufanda Lana Merino',
        description: 'Bufanda de lana merino extra suave. Calidez y estilo para el invierno.',
        price: 59.99,
        category: 'Accesorios',
        colors: [colors[3], colors[6], colors[0], colors[4]],
        materials: ['Lana'],
        sizes: sizesAccessories,
        tags: ['bufanda', 'lana', 'invierno', 'cálido']
    },
    {
        name: 'Gorra Baseball Urban',
        description: 'Gorra estilo baseball con cierre ajustable. Look urbano y casual.',
        price: 29.99,
        category: 'Accesorios',
        colors: [colors[0], colors[1], colors[2], colors[5]],
        materials: ['Algodón'],
        sizes: sizesAccessories,
        tags: ['gorra', 'baseball', 'urban', 'casual']
    },
    {
        name: 'Cartera Minimalista',
        description: 'Cartera slim de cuero con protección RFID. Diseño minimalista y seguro.',
        price: 69.99,
        category: 'Accesorios',
        colors: [colors[0], colors[7], colors[2]],
        materials: ['Cuero'],
        sizes: sizesAccessories,
        tags: ['cartera', 'minimalista', 'cuero', 'rfid']
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Delete all existing products
        await Product.deleteMany({});
        console.log('✅ All existing products deleted');

        // Create products
        const createdProducts = [];

        for (let i = 0; i < productsData.length; i++) {
            const data = productsData[i];
            const images = getProductImages(data.category, i);
            const inventory = generateInventory(data.colors, data.materials, data.sizes);
            const sizeStock = generateSizeStock(data.sizes, inventory);

            const product = await Product.create({
                name: data.name,
                description: data.description,
                price: data.price,
                category: data.category,
                image: images.main,
                images: images.gallery,
                colors: data.colors,
                materials: data.materials,
                sizes: data.sizes,
                inventory,
                sizeStock,
                tags: data.tags,
                discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0, // 30% chance of discount
                rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
                numReviews: Math.floor(Math.random() * 50)
            });

            createdProducts.push(product);
            console.log(`✅ Created: ${product.name} (${product.inventory.length} inventory items)`);
        }

        console.log(`\n🎉 Successfully created ${createdProducts.length} products!`);
        console.log('\nSummary by category:');
        const categories = ['Hombre', 'Mujer', 'Niños', 'Accesorios'];
        categories.forEach(cat => {
            const count = createdProducts.filter(p => p.category === cat).length;
            console.log(`  - ${cat}: ${count} products`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedProducts();
