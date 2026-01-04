import mongoose from 'mongoose';

// Use in-memory database for tests
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utopia_test';
});

afterAll(async () => {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});

// Clear database between tests
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});
