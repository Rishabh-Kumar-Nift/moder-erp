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
    pr_fabric_id, 
    po_number, 
    fabric_type, 
    supplier_name, 
    finalized_quantity, 
    cost_per_unit, 
    total_cost, 
    expected_delivery_date, 
    approval_status 
  } = req.body;

  // ✅ Log the received data to debug
  console.log('Received PO Data:', {
    pr_fabric_id,
    po_number,
    fabric_type,
    supplier_name,
    finalized_quantity,
    cost_per_unit,
    total_cost,
    expected_delivery_date,
    approval_status
  });

  // Check if pr_fabric_id is undefined or invalid
  if (!pr_fabric_id) {
    console.error('❌ pr_fabric_id is missing or invalid.');
    return res.status(400).json({ error: 'pr_fabric_id is required!' });
  }

  try {
    await pool.query(
      `INSERT INTO po_fabric 
      (pr_fabric_id, po_number, fabric_type, supplier_name, finalized_quantity, cost_per_unit, expected_delivery_date, approval_status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [pr_fabric_id, po_number, fabric_type, supplier_name, finalized_quantity, cost_per_unit, expected_delivery_date, approval_status || 'Pending']
    );

    res.status(201).json({ message: 'Purchase Order for fabric added successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add PO for fabric.' });
  }
});

module.exports = router;
