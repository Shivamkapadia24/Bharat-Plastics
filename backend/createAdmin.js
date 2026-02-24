const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createOrResetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'admin@greennets.com';
    const password = 'Admin@123'; // temporary password

    let user = await User.findOne({ email });

    if (user) {
        user.password = await bcrypt.hash(password, 10);
        user.role = 'admin';
        await user.save();
        console.log('✅ Admin password & role updated');
        } else {
        user = new User({
            name: 'Admin',
            email,
            password: await bcrypt.hash(password, 10),
            role: 'admin'
        });
        await user.save();
        console.log('✅ Admin user created');
        }


    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createOrResetAdmin();
