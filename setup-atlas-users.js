// Create test users in MongoDB Atlas (same as server)
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/Back/models/user.model');

async function createAtlasTestUsers() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB Atlas');
        
        // Clean up any existing test data
        await User.deleteMany({ 
            $or: [
                { login_name: { $regex: /^test_/ } },
                { first_name: 'Duplicate' }
            ]
        });
        console.log('Cleaned up test users');
        
        const testUsers = [
            {
                login_name: 'admin',
                password: 'admin123',
                first_name: 'Admin',
                last_name: 'User',
                location: 'System',
                description: 'System administrator',
                occupation: 'Administrator'
            },
            {
                login_name: 'john_doe',
                password: 'password123',
                first_name: 'John',
                last_name: 'Doe',
                location: 'San Francisco, CA',
                description: 'Software developer and photography enthusiast',
                occupation: 'Software Engineer'
            },
            {
                login_name: 'jane_smith',
                password: 'password123',
                first_name: 'Jane',
                last_name: 'Smith',
                location: 'New York, NY',
                description: 'Professional photographer',
                occupation: 'Photographer'
            }
        ];
        
        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ login_name: userData.login_name });
            if (existingUser) {
                // Update password if user exists
                existingUser.password = userData.password;
                await existingUser.save();
                console.log(`✓ Updated password for user: ${userData.login_name}`);
            } else {
                // Create new user
                const user = new User(userData);
                await user.save();
                console.log(`✓ Created user: ${userData.login_name} (password: ${userData.password})`);
            }
        }
        
        // List all users
        const allUsers = await User.find({});
        console.log('\n--- All Users in Atlas Database ---');
        for (const user of allUsers) {
            console.log(`${user.login_name} - ${user.first_name} ${user.last_name} (password: ${user.password ? '[SET]' : '[MISSING]'})`);
        }
        
        console.log('\nAtlas test users created/updated successfully!');
        console.log('You can now test the login/registration functionality');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAtlasTestUsers();
