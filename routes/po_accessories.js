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

// ✅ Add PO for Fabric
router.post('/add', verifyToken, async (req, res) => {
  const { 
    pr_accessory_id, 
    po_number, 
    accessories_type, 
    vendor_details, 
    finalized_quantity, 
    price_per_unit, 
    expected_delivery_date, 
    approval_status 
  } = req.body;

  // ✅ Log the received data to debug
  console.log('Received PO Data:', {
    pr_accessory_id, 
    po_number, 
    accessories_type, 
    vendor_details, 
    finalized_quantity, 
    price_per_unit, 
    expected_delivery_date, 
    approval_status 
  });

  // Check if pr_fabric_id is undefined or invalid
  if (!pr_accessory_id) {
    console.error('❌ pr_accessory_id is missing or invalid.');
    return res.status(400).json({ error: 'pr_accessory_id is required!' });
  }

  try {
    await pool.query(
      `INSERT INTO po_accessories 
      (pr_accessory_id, po_number, accessories_type, vendor_details, finalized_quantity, price_per_unit, expected_delivery_date, approval_status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [pr_accessory_id, po_number, accessories_type, vendor_details, finalized_quantity, price_per_unit, expected_delivery_date, approval_status || 'Pending']
    );

    res.status(201).json({ message: 'Purchase Order for Accessories added successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add PO for Accessories.' });
  }
});

module.exports = router;