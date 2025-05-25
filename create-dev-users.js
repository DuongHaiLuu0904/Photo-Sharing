// Create test users for development
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');

async function createTestUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/photo-sharing');
        console.log('Connected to MongoDB');
        
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
                console.log(`User ${userData.login_name} already exists, skipping...`);
                continue;
            }
            
            const user = new User(userData);
            await user.save();
            console.log(`✓ Created user: ${userData.login_name} (password: ${userData.password})`);
        }
        
        console.log('\nTest users created successfully!');
        console.log('You can now test the login/registration functionality');
        
    } catch (error) {
        console.error('Error creating test users:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUsers();
