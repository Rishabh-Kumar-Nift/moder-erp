const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// ✅ JWT Verification Middleware
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, 'mysecretkey', (err, authData) => {
            if (err) {
                res.status(403).json({ error: 'Invalid token' }); // Better error message
            } else {
                req.authData = authData; // Add user data to request
                next();
            }
        });
    } else {
        res.status(403).json({ error: 'Token not provided' }); // More informative
    }
}

// ✅ Add PR for Fabric with returning ID
router.post('/add', verifyToken, async (req, res) => {
  console.log('👉 Received PR Fabric Request:', req.body);

  const {
    style_id,
    fabric_type,
    composition,
    color,
    gsm,
    required_quantity,
    unit,
    expected_delivery_date,
    remarks
  } = req.body;

  console.log('✅ Extracted Data:', {
    style_id,
    fabric_type,
    composition,
    color,
    gsm,
    required_quantity,
    unit,
    expected_delivery_date,
    remarks
  });

  try {
    const [result] = await pool.query(
      `INSERT INTO pr_fabric 
      (style_id, fabric_type, composition, color, gsm, required_quantity, unit, expected_delivery_date, remarks) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        style_id,
        fabric_type,
        composition,
        color,
        gsm,
        required_quantity,
        unit,
        expected_delivery_date,
        remarks
      ]
    );

    console.log('✅ Insert Result:', result);
    res.status(201).json({
      message: 'Purchase Requisition for fabric added successfully!',
      pr_fabric_id: result.insertId
    });
  } catch (err) {
    console.error('❌ Error inserting PR Fabric:', err.message);
    res.status(500).json({ error: 'Failed to add PR for fabric.' });
  }
});

// ✅ Export Router
module.exports = router;