// Check users and their passwords
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');

async function inspectUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/photo-sharing');
        console.log('Connected to MongoDB');
        
        const users = await User.find({});
        console.log('\n--- All Users in Database ---');
        
        for (const user of users) {
            console.log(`Login: ${user.login_name}`);
            console.log(`Name: ${user.first_name} ${user.last_name}`);
            console.log(`Password: ${user.password ? '[SET]' : '[MISSING]'}`);
            console.log(`Password value: "${user.password}"`);
            console.log('---');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

inspectUsers();
