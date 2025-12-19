const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/sitemap
// @desc    Generate XML sitemap
// @access  Public
router.get('/', async (req, res) => {
    try {
        const baseUrl = process.env.CLIENT_URL || 'https://luxethread.com';

        // Static pages
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/cart', priority: '0.5', changefreq: 'monthly' },
            { url: '/login', priority: '0.3', changefreq: 'monthly' },
            { url: '/register', priority: '0.3', changefreq: 'monthly' },
            { url: '/track-order', priority: '0.5', changefreq: 'monthly' }
        ];

        // Category pages
        const categories = ['Hombre', 'Mujer', 'Niños', 'Accesorios'];
        const categoryPages = categories.map(cat => ({
            url: `/?category=${encodeURIComponent(cat)}`,
            priority: '0.8',
            changefreq: 'daily'
        }));

        // Product pages
        const products = await Product.find({}).select('slug updatedAt').lean();
        const productPages = products.map(product => ({
            url: `/product/${product.slug || product._id}`,
            priority: '0.9',
            changefreq: 'weekly',
            lastmod: product.updatedAt?.toISOString().split('T')[0]
        }));

        // Generate XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoryPages, ...productPages].map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).json({ message: 'Error generating sitemap' });
    }
});

// @route   GET /api/sitemap/robots
// @desc    Get robots.txt content
// @access  Public
router.get('/robots', (req, res) => {
    const baseUrl = process.env.CLIENT_URL || 'https://luxethread.com';
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile
Disallow: /checkout
Disallow: /api/

Sitemap: ${baseUrl}/api/sitemap
`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

module.exports = router;
