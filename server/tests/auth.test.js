/**
 * Authentication Integration Tests
 * 
 * Tests: Register, Login, Protected Routes
 */

const request = require('supertest');
const app = require('./app');
const User = require('../models/User');

describe('Authentication API', () => {

    // ==========================================
    // REGISTRATION TESTS
    // ==========================================

    describe('POST /api/auth/register', () => {

        it('should register a new user successfully (201)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('_id');
            expect(res.body.email).toBe('test@example.com');
            expect(res.body.role).toBe('user'); // SECURITY: Always user role
            expect(res.body).not.toHaveProperty('password');
        });

        it('should reject duplicate email (400)', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'First User',
                    email: 'duplicate@example.com',
                    password: 'password123'
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Second User',
                    email: 'duplicate@example.com',
                    password: 'password456'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/already exists|ya existe/i);
        });

        it('should reject missing fields (400)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'incomplete@example.com'
                    // Missing name and password
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject weak password (400)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Weak Password User',
                    email: 'weak@example.com',
                    password: '123' // Too short
                });

            expect(res.statusCode).toBe(400);
        });

        it('SECURITY: should ignore role in request body', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Hacker',
                    email: 'hacker@example.com',
                    password: 'password123',
                    role: 'admin' // Attempted privilege escalation
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.role).toBe('user'); // Must always be user
        });
    });

    // ==========================================
    // LOGIN TESTS
    // ==========================================

    describe('POST /api/auth/login', () => {

        beforeEach(async () => {
            // Create a user for login tests using unique email
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login Test User',
                    email: 'login-test@example.com',
                    password: 'correctpassword'
                });
        });

        it('should login successfully with correct credentials (200)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login-test@example.com',
                    password: 'correctpassword'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe('login-test@example.com');
        });

        it('should reject wrong password (401)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login-test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toMatch(/invalid/i);
        });

        it('should reject non-existent email (401)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'anypassword'
                });

            expect(res.statusCode).toBe(401);
        });

        it('should normalize email case', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'LOGIN-TEST@EXAMPLE.COM', // Uppercase
                    password: 'correctpassword'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    // ==========================================
    // PROTECTED ROUTES TESTS
    // ==========================================

    describe('GET /api/auth/me (Protected Route)', () => {

        let validToken;

        beforeEach(async () => {
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Protected Route User',
                    email: 'protected-route@example.com',
                    password: 'password123'
                });

            validToken = registerRes.body.token;
        });

        it('should return user data with valid token (200)', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('protected-route@example.com');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should reject request without token (401)', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toMatch(/not authorized|no token/i);
        });

        it('should reject invalid token (401)', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(res.statusCode).toBe(401);
        });

        it('should reject malformed authorization header (401)', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'NotBearer token');

            expect(res.statusCode).toBe(401);
        });
    });
});
