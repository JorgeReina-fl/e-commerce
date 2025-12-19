/**
 * Cart API Integration Tests
 * 
 * Tests: Authentication, Add to cart, Stock validation
 */

const request = require('supertest');
const app = require('./app');
const Product = require('../models/Product');

describe('Cart API', () => {

    let testProductId;
    let authToken;

    beforeEach(async () => {
        // Create test product
        const product = await Product.create({
            name: 'Cart Test Product',
            description: 'For cart testing',
            price: 59.99,
            category: 'Hombre',
            image: 'https://example.com/product.jpg',
            sizeStock: [
                { size: 'S', stock: 5 },
                { size: 'M', stock: 10 },
                { size: 'XL', stock: 0 } // Out of stock
            ]
        });
        testProductId = product._id.toString();

        // Register and get token
        const email = `cart-${Date.now()}@test.com`;
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Cart User', email, password: 'password123' });
        authToken = res.body.token;
    });

    describe('Authentication', () => {

        it('GET /api/cart requires token (401)', async () => {
            const res = await request(app).get('/api/cart');
            expect(res.statusCode).toBe(401);
        });

        it('POST /api/cart/items requires token (401)', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .send({ productId: testProductId, size: 'M', quantity: 1 });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Cart Operations', () => {

        it('should get empty cart (200)', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.items).toEqual([]);
        });

        it('should add item to cart (200)', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProductId,
                    size: 'M',
                    quantity: 2
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.items.length).toBe(1);
            expect(res.body.items[0].quantity).toBe(2);
        });

        it('should require size parameter (400)', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProductId,
                    quantity: 1
                    // Missing size
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject insufficient stock (400)', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProductId,
                    size: 'S', // Only 5 in stock
                    quantity: 100
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/stock/i);
        });

        it('should reject out of stock size (400)', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProductId,
                    size: 'XL', // 0 in stock
                    quantity: 1
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/stock/i);
        });
    });
});
