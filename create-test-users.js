// Script to create test users with login_name
const mongoose = require('mongoose');
const User = require('./src/Back/models/user.model');
require('dotenv').config();

// Connect to MongoDB using the same connection string as the server
mongoose.connect(process.env.DB_URL);

const createTestUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('Users already exist in database');
      mongoose.disconnect();
      return;
    }

    const testUsers = [
      {
        first_name: 'Ian',
        last_name: 'Malcolm',
        location: 'Austin, TX',
        description: 'Chaos theorist',
        occupation: 'Mathematician',
        login_name: 'ianmalcolm'
      },
      {
        first_name: 'Ellen',
        last_name: 'Ripley',
        location: 'Nostromo',
        description: 'Warrant Officer',
        occupation: 'Space Engineer',
        login_name: 'ellenripley'
      },
      {
        first_name: 'Obi-Wan',
        last_name: 'Kenobi',
        location: 'Tatooine',
        description: 'Jedi Master',
        occupation: 'Jedi Knight',
        login_name: 'obiwankenobi'
      },
      {
        first_name: 'April',
        last_name: 'Ludgate',
        location: 'Pawnee, IN',
        description: 'Parks Department',
        occupation: 'Intern',
        login_name: 'aprilludgate'
      },
      {
        first_name: 'Peregrin',
        last_name: 'Took',
        location: 'Shire',
        description: 'Hobbit',
        occupation: 'Adventurer',
        login_name: 'peregrintook'
      }
    ];

    const created = await User.insertMany(testUsers);
    console.log(`Created ${created.length} test users:`);
    created.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (login: ${user.login_name})`);
    });
    
    console.log('Test users created successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test users:', error);
    mongoose.disconnect();
  }
};

createTestUsers();
