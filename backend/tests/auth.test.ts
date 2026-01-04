import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import User from '../src/models/User';
import authRoutes from '../src/routes/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
    beforeAll(async () => {
        // Connect to test database
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/utopia_test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear users before each test
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        const validUser = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123',
        };

        it('should register a new user with valid data', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe(validUser.email);
            expect(res.body.name).toBe(validUser.name);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Test' }) // Missing email, phone, password
                .expect(400);

            expect(res.body.message).toBe('Please add all fields');
        });

        it('should return 400 if user already exists (same email)', async () => {
            // Create user first
            await request(app).post('/api/auth/register').send(validUser);

            // Try to register again
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(400);

            expect(res.body.message).toBe('User already exists');
        });

        it('should return 400 if user already exists (same phone)', async () => {
            await request(app).post('/api/auth/register').send(validUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, email: 'different@example.com' })
                .expect(400);

            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123',
        };

        beforeEach(async () => {
            // Register a user before login tests
            await request(app).post('/api/auth/register').send(testUser);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe(testUser.email);
        });

        it('should return 401 with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should return 401 with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
                .expect(401);

            expect(res.body.message).toBe('Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 without token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(res.body.message).toContain('Not authorized');
        });

        it('should return user data with valid token', async () => {
            // Register and get token
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '1234567890',
                    password: 'password123',
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.email).toBe('test@example.com');
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken123')
                .expect(401);

            expect(res.body.message).toContain('Not authorized');
        });
    });
});
