// Add passwords to existing users in Atlas
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/Back/models/user.model');

async function addPasswordsToExistingUsers() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB Atlas');
        
        // Find users without passwords
        const usersWithoutPasswords = await User.find({ 
            $or: [
                { password: { $exists: false } },
                { password: '' },
                { password: null }
            ]
        });
        
        console.log(`Found ${usersWithoutPasswords.length} users without passwords`);
        
        for (const user of usersWithoutPasswords) {
            user.password = 'password123'; // Default password for existing users
            await user.save();
            console.log(`✓ Added password to ${user.login_name}`);
        }
        
        // List all users with their password status
        const allUsers = await User.find({});
        console.log('\n--- All Users Status ---');
        for (const user of allUsers) {
            console.log(`${user.login_name} - ${user.first_name} ${user.last_name} (password: ${user.password})`);
        }
        
        console.log('\nAll users now have passwords!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

addPasswordsToExistingUsers();
