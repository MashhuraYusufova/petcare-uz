const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

// =========================
// GET ROUTES
// =========================

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Dashboard page
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.send(`
    <h1>Dashboard</h1>
    <p>Welcome ${req.session.user.fullName}</p>
    <p>Role: ${req.session.user.role}</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// =========================
// POST ROUTES
// =========================

// Register user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      phone,
      address
    });

    await newUser.save();
    res.send('Registration successful');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error during registration');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send('Invalid password');
    }

    req.session.user = user;
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error during login');
  }
});

module.exports = router;