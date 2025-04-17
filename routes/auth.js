const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const SECRET_KEY = 'mysecretkey';

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password, securityQuestion, securityAnswer } = req.body;
  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10); // Normalize and hash answer
    await pool.query(
      'INSERT INTO users (username, email, password, security_question, security_answer, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, securityQuestion, hashedAnswer]
    );
    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user[0].id, username: user[0].username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password - Get Security Question
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  try {
    const [user] = await pool.query('SELECT security_question FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Username not found' });
    }
    res.json({ securityQuestion: user[0].security_question });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Security Answer
router.post('/verify-answer', async (req, res) => {
  const { username, securityAnswer } = req.body;
  try {
    const [user] = await pool.query('SELECT security_answer FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Username not found' });
    }

    const validAnswer = await bcrypt.compare(securityAnswer.toLowerCase(), user[0].security_answer);
    if (!validAnswer) {
      return res.status(400).json({ error: 'Incorrect security answer' });
    }

    res.json({ message: 'Answer verified' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Username not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;