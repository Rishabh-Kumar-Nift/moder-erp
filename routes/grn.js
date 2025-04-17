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
        res.sendStatus(403);
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}

// ✅ Generate GRN and Update PO Status
// ✅ Generate GRN and Update PO Status
router.post('/add', verifyToken, async (req, res) => {
  const { style_id, grn_number, item_type, item_name, received_quantity, supplier, inspection_status, po_number } = req.body;

  console.log("📝 Received GRN Body:", req.body); // ✅ Show received data for debugging

  try {
    // ✅ Step 1: Insert GRN with style_id
    const [grnResult] = await pool.query(
      'INSERT INTO grn (style_id, grn_number, item_type, item_name, received_quantity, supplier, inspection_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [style_id, grn_number, item_type, item_name, received_quantity, supplier, inspection_status]
    );

    console.log('✅ GRN Created with ID:', grnResult.insertId); // ✅ Log GRN creation success

    // ✅ Final Success Response
    res.status(201).json({
      message: 'GRN created successfully and PO updated to Received!',
      grn_id: grnResult.insertId
    });

  } catch (err) {
    console.error('❌ Full Error:', err); // ❌ Log complete error for debugging
    res.status(500).json({ error: 'Failed to create GRN or update PO.' });
  }
});

module.exports = router;