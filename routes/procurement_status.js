const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

const SECRET_KEY = 'mysecretkey';

// JWT Verification Middleware
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, authData) => {
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

// Get Dashboard Data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    // Get total styles count
    const [stylesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM styles'
    );

    // Get BOM items count
    const [bomCount] = await pool.query(
      'SELECT COUNT(*) as count FROM bom'
    );

    // Get PR Fabric count
    const [prFabricCount] = await pool.query(
      'SELECT COUNT(*) as count FROM pr_fabric'
    );

    // Get PR Accessories count
    const [prAccessoriesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM pr_accessories'
    );

    // Get PO Fabric count
    const [poFabricCount] = await pool.query(
      'SELECT COUNT(*) as count FROM po_fabric'
    );

    // Get PO Accessories count
    const [poAccessoriesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM po_accessories'
    );

    // Get GRN count
    const [grnCount] = await pool.query(
      'SELECT COUNT(*) as count FROM grn'
    );

    // Get recent styles with their procurement status
    const [recentStyles] = await pool.query(`
      SELECT 
        s.style_id,
        s.style_number,
        s.style_name,
        s.sample_type,
        s.expected_completion_date,
        COUNT(DISTINCT b.bom_id) as bom_count,
        COUNT(DISTINCT prf.pr_fabric_id) as pr_fabric_count,
        COUNT(DISTINCT pra.pr_accessories_id) as pr_accessories_count,
        COUNT(DISTINCT pof.po_fabric_id) as po_fabric_count,
        COUNT(DISTINCT poa.po_accessories_id) as po_accessories_count,
        COUNT(DISTINCT g.grn_id) as grn_count
      FROM styles s
      LEFT JOIN bom b ON s.style_id = b.style_id
      LEFT JOIN pr_fabric prf ON s.style_id = prf.style_id
      LEFT JOIN pr_accessories pra ON s.style_id = pra.style_id
      LEFT JOIN po_fabric pof ON s.style_id = pof.style_id
      LEFT JOIN po_accessories poa ON s.style_id = poa.style_id
      LEFT JOIN grn g ON s.style_id = g.style_id
      GROUP BY s.style_id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    res.json({
      summary: {
        styles: stylesCount[0].count,
        bom: bomCount[0].count,
        prFabric: prFabricCount[0].count,
        prAccessories: prAccessoriesCount[0].count,
        poFabric: poFabricCount[0].count,
        poAccessories: poAccessoriesCount[0].count,
        grn: grnCount[0].count
      },
      recentStyles
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;