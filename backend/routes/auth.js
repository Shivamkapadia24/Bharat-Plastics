const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import the User model
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST route for user registration (Functional)
router.post('/register', async (req, res) => {
    // 1. Get data from request body
    const { name, email, password } = req.body;

    // 2. Basic Validation (add more robust validation later)
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    try {
        // 3. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' }); // 409 Conflict
        }

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash password with salt

        // 5. Create a new user instance
        const newUser = new User({
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword // Store the hashed password
        });

        // 6. Save the user to the database
        const savedUser = await newUser.save();

        // 7. Send successful response (don't send password back)
        res.status(201).json({ 
            message: 'User registered successfully!',
            userId: savedUser._id // Send back the new user's ID
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST route for user login (Functional)
router.post('/login', async (req, res) => {
    // 1. Get data from request body
    const { email, password } = req.body;

    // 2. Basic Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // 3. Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // User not found
            return res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
        }

        // 4. Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Passwords don't match
            return res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
        }

        // Inside the POST /login route, after confirming password match:

// 5. Login successful! Generate a JWT
const payload = {
  user: {
    id: user.id,
    role: user.role   // NEW
  }
};

jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { expiresIn: '7d' },
  (err, token) => {
    if (err) throw err;
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role   // NEW
      }
    });
  }
);

// DO NOT send the password back!

// The rest of the try...catch block remains the same

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router; // Export the router