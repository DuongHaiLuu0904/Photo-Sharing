// Clean up duplicate and test users, and reset admin users
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');

async function cleanupAndReset() {
    try {
        await mongoose.connect('mongodb://localhost:27017/photo-sharing');
        console.log('Connected to MongoDB');
        
        // Remove test and duplicate users
        await User.deleteMany({ 
            $or: [
                { login_name: { $regex: /^test_/ } },
                { first_name: 'Duplicate' },
                { login_name: 'admin' }
            ]
        });
        console.log('Cleaned up test and duplicate users');
        
        // Add passwords to existing users that don't have them
        const usersWithoutPasswords = await User.find({ password: { $exists: false } });
        console.log(`Found ${usersWithoutPasswords.length} users without passwords`);
        
        for (const user of usersWithoutPasswords) {
            user.password = 'password123'; // Default password
            await user.save();
            console.log(`Added password to ${user.login_name}`);
        }
        
        // Create fresh admin user
        const adminExists = await User.findOne({ login_name: 'admin' });
        if (!adminExists) {
            const admin = new User({
                login_name: 'admin',
                password: 'admin123',
                first_name: 'Admin',
                last_name: 'User',
                location: 'System',
                description: 'System administrator',
                occupation: 'Administrator'
            });
            await admin.save();
            console.log('Created admin user');
        }
        
        // List all users
        const allUsers = await User.find({});
        console.log('\n--- Current Users ---');
        for (const user of allUsers) {
            console.log(`${user.login_name} - ${user.first_name} ${user.last_name} (password: ${user.password})`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupAndReset();
