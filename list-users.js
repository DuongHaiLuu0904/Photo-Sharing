// Script to list existing users
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');
require('dotenv').config();

// Connect to MongoDB using the same connection string as the server
mongoose.connect(process.env.DB_URL);

const listUsers = async () => {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (login: ${user.login_name || 'NO LOGIN NAME'})`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error listing users:', error);
    mongoose.disconnect();
  }
};

listUsers();
