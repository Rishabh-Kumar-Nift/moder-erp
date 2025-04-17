const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

require('dotenv').config(); // ✅ Load environment variables at the top

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, 'mysecretkey', (err, authData) => {
      if (err) {
        console.error('JWT verification error:', err);
        res.sendStatus(403); // Invalid Token
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.sendStatus(403); // No Token Provided
  }
}

router.post('/add', verifyToken, async (req, res) => {
  const user_id = req.authData.userId; // From JWT
  const { style_number, style_name, buyer_name, sample_type, expected_completion_date, remarks } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO styles (user_id, style_number, style_name, buyer_name, sample_type, expected_completion_date, remarks, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [user_id, style_number, style_name, buyer_name, sample_type, expected_completion_date, remarks]
    );

    res.status(201).json({
      message: 'Style added successfully!',
      style_id: result.insertId
    });
  } catch (err) {
    console.error('Error inserting style:', err.message);
    res.status(500).json({ error: 'Failed to add style.' });
  }
});

// ✅ Get Total Styles Count (Public Route for Dashboard)
router.get('/count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS totalStyles FROM styles');
    res.json({ totalStyles: rows[0].totalStyles });
  } catch (err) {
    console.error('Error fetching style count:', err.message);
    res.status(500).json({ error: 'Failed to fetch style count' });
  }
});

// ✅ Get All Styles API
router.get('/all', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id AS style_id,
        s.style_number,
        s.style_name,
        s.buyer_name,
        s.sample_type,
        s.expected_completion_date,
        s.remarks,
        u.username AS created_by
      FROM styles s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching styles:', err.message);
    res.status(500).json({ error: 'Failed to fetch styles.' });
  }
});

// Get Styles By Buyer Name for Dashboard
router.get('/by-buyer', async (req, res) => {
  try {
    const query = `
      SELECT 
        buyer_name AS buyer,
        COUNT(*) AS count
      FROM styles
      WHERE buyer_name IS NOT NULL AND buyer_name != ''
      GROUP BY buyer_name
      ORDER BY count DESC
    `;
    
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching styles by buyer:', err.message);
    res.status(500).json({ error: 'Failed to fetch styles by buyer' });
  }
});

// Get Recent Styles
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.style_number,
        s.style_name,
        s.buyer_name,
        s.sample_type,
        s.expected_completion_date,
        s.remarks,
        s.created_at
      FROM styles s
      ORDER BY s.created_at DESC
      LIMIT 10
    `;
    
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching recent styles:', err.message);
    res.status(500).json({ error: 'Failed to fetch recent styles' });
  }
});

// Get Buyers Count
router.get('/buyers/count', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT buyer_name) AS totalBuyers
      FROM styles
      WHERE buyer_name IS NOT NULL AND buyer_name != ''
    `;
    
    const [results] = await pool.query(query);
    res.json({ totalBuyers: results[0].totalBuyers });
  } catch (err) {
    console.error('Error fetching buyers count:', err.message);
    res.status(500).json({ error: 'Failed to fetch buyers count' });
  }
});

module.exports = router;