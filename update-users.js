// Simple script to add login_name to existing users
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.DB_URL);

const updateUsers = async () => {
  try {
    const users = await User.find({});
    console.log('Found users:', users.length);
    
    for (let user of users) {
      if (!user.login_name) {
        // Create a login_name from first_name + last_name
        const loginName = (user.first_name + user.last_name).toLowerCase().replace(/\s+/g, '');
        user.login_name = loginName;
        await user.save();
        console.log(`Updated user ${user.first_name} ${user.last_name} with login_name: ${loginName}`);
      } else {
        console.log(`User ${user.first_name} ${user.last_name} already has login_name: ${user.login_name}`);
      }
    }
    
    console.log('All users updated successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating users:', error);
    mongoose.disconnect();
  }
};

updateUsers();
