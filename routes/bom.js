const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// File Upload Destination and Naming
const storage = multer.diskStorage({
  destination: './uploads/materials/',  // ✅ This path is relative to project root
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File Upload Middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

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

// ✅ Add BOM Item
router.post('/add', verifyToken, upload.single('material_file'), async (req, res) => {
  const { style_id, material_type, material_description, quantity_required, unit, sourcing_location } = req.body;
  const material_file = req.file ? req.file.filename : null; // Get uploaded file name

  try {
    await pool.query(
      'INSERT INTO bom (style_id, material_type, material_description, quantity_required, unit, sourcing_location, material_file) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [style_id, material_type, material_description, quantity_required, unit, sourcing_location, material_file]
    );

    res.status(201).json({ message: 'BOM item added successfully with file!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add BOM item.' });
  }
});

module.exports = router;