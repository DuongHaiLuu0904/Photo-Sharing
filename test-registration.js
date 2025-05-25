// Test script for user registration functionality
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');

async function testRegistration() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/photo-sharing', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');
        
        // Test 1: Check if we can create a new user with password
        const testUser = {
            login_name: 'testuser123',
            password: 'testpassword',
            first_name: 'Test',
            last_name: 'User',
            location: 'Test City',
            description: 'This is a test user',
            occupation: 'Tester'
        };
        
        console.log('\n--- Test 1: Creating new user ---');
        try {
            const newUser = new User(testUser);
            const savedUser = await newUser.save();
            console.log('✓ User created successfully:', savedUser.login_name);
            
            // Clean up test user
            await User.deleteOne({ login_name: 'testuser123' });
            console.log('✓ Test user cleaned up');
        } catch (error) {
            console.log('✗ Error creating user:', error.message);
        }
        
        // Test 2: Check existing users and add passwords if missing
        console.log('\n--- Test 2: Checking existing users ---');
        const existingUsers = await User.find({});
        console.log(`Found ${existingUsers.length} existing users`);
        
        for (const user of existingUsers) {
            if (!user.password) {
                console.log(`Adding password to user: ${user.login_name}`);
                user.password = 'password123'; // Default password for existing users
                await user.save();
                console.log(`✓ Password added to ${user.login_name}`);
            } else {
                console.log(`✓ User ${user.login_name} already has password`);
            }
        }
        
        console.log('\n--- Test completed successfully ---');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testRegistration();
