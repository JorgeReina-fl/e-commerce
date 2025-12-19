/**
 * Products API Integration Tests
 */

const request = require('supertest');
const app = require('./app');
const Product = require('../models/Product');

describe('Products API', () => {

    beforeEach(async () => {
        await Product.insertMany([
            {
                name: 'Product A',
                description: 'Desc A',
                price: 49.99,
                category: 'Hombre',
                image: 'https://example.com/a.jpg',
                sizeStock: [{ size: 'M', stock: 10 }]
            },
            {
                name: 'Product B',
                description: 'Desc B',
                price: 79.99,
                category: 'Mujer',
                image: 'https://example.com/b.jpg',
                sizeStock: [{ size: 'S', stock: 5 }]
            }
        ]);
    });

    describe('GET /api/products', () => {

        it('should return products list (200)', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(res.body.products.length).toBe(2);
        });

        it('should filter by category', async () => {
            const res = await request(app).get('/api/products?category=Hombre');
            expect(res.statusCode).toBe(200);
            expect(res.body.products.length).toBe(1);
        });
    });

    describe('GET /api/products/:id', () => {

        it('should get single product (200)', async () => {
            // Create and retrieve directly
            const product = await Product.findOne({ name: 'Product A' });

            const res = await request(app).get(`/api/products/${product._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name');
        });

        it('should return 404 for non-existent', async () => {
            const res = await request(app).get('/api/products/507f1f77bcf86cd799439011');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('Security', () => {

        it('POST requires auth (401)', async () => {
            const res = await request(app).post('/api/products').send({});
            expect(res.statusCode).toBe(401);
        });
    });
});
