const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the JWT token
 */
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, 'mysecretkey', (err, authData) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.sendStatus(403);
      }
      req.authData = authData;
      next();
    });
  } else {
    res.sendStatus(403);
  }
}

/**
 * Get total styles count
 */
router.get('/styles/count', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) AS totalStyles FROM styles';
    
    const [results] = await pool.query(query);
    res.json({ totalStyles: results[0].totalStyles });
  } catch (err) {
    console.error('Error fetching styles count:', err.message);
    res.status(500).json({ error: 'Failed to fetch styles count' });
  }
});

/**
 * Get charts data (styles by sample type and material types)
 */
router.get('/charts-data', verifyToken, async (req, res) => {
  try {
    // Get styles by sample type
    const sampleTypeQuery = `
      SELECT 
        CASE 
          WHEN sample_type = 'Proto' THEN 'Proto'
          WHEN sample_type = 'Fit' THEN 'Fit'
          WHEN sample_type = 'PP' THEN 'PP'
          WHEN sample_type = 'Shipment' THEN 'Shipment'
          WHEN sample_type = 'Counter' THEN 'Counter'
          ELSE sample_type
        END AS category,
        COUNT(*) AS count
      FROM styles
      WHERE sample_type IS NOT NULL AND sample_type != ''
      GROUP BY sample_type
      ORDER BY count DESC
    `;
    
    // Get material types distribution
    const materialTypeQuery = `
      SELECT 
        material_type AS materialType,
        COUNT(*) AS count
      FROM bom
      WHERE material_type IS NOT NULL AND material_type != ''
      GROUP BY material_type
      ORDER BY count DESC
    `;
    
    // Execute queries
    const [sampleTypeResults] = await pool.query(sampleTypeQuery);
    const [materialResults] = await pool.query(materialTypeQuery);
    
    res.json({
      stylesByBuyer: sampleTypeResults, // Keeping the same response property name
      materialTypes: materialResults
    });
  } catch (err) {
    console.error('Error fetching charts data:', err.message);
    res.status(500).json({ error: 'Failed to fetch charts data' });
  }
});

/**
 * Get recent styles (with username)
 */
router.get('/styles/recent', verifyToken, async (req, res) => {
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
        s.created_at,
        u.username
      FROM styles s
      LEFT JOIN users u ON s.user_id = u.id
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

/**
 * Get count of distinct buyers
 */
router.get('/styles/buyers/count', verifyToken, async (req, res) => {
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

/**
 * Search styles by term
 */
router.get('/styles/search', verifyToken, async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term || term.length < 2) {
      return res.json({ styles: [] });
    }
    
    const query = `
      SELECT 
        id, 
        style_number, 
        style_name,
        buyer_name,
        sample_type, 
        expected_completion_date
      FROM styles
      WHERE 
        style_number LIKE ? OR 
        style_name LIKE ? OR 
        buyer_name LIKE ? OR
        sample_type LIKE ?
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const [results] = await pool.query(query, [
      `%${term}%`, 
      `%${term}%`,
      `%${term}%`,
      `%${term}%`
    ]);
    
    res.json({ styles: results });
  } catch (err) {
    console.error('Error searching styles:', err.message);
    res.status(500).json({ error: 'Failed to search styles' });
  }
});

/**
 * Get recent BOM items (with username)
 */
router.get('/bom/recent', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        s.style_number,
        b.material_type,
        b.material_description,
        b.quantity_required,
        b.unit,
        b.sourcing_location,
        b.created_at,
        u.username
      FROM bom b
      JOIN styles s ON b.style_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching recent BOM items:', err.message);
    res.status(500).json({ error: 'Failed to fetch recent BOM items' });
  }
});

/**
 * Get total BOM items count
 */
router.get('/bom/count', verifyToken, async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS totalBOMItems FROM bom`;
    
    const [results] = await pool.query(query);
    res.json({ totalBOMItems: results[0].totalBOMItems });
  } catch (err) {
    console.error('Error fetching BOM count:', err.message);
    res.status(500).json({ error: 'Failed to fetch BOM count' });
  }
});

/**
 * Get count of unique material types
 */
router.get('/bom/material-types/count', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT material_type) AS totalMaterialTypes
      FROM bom
      WHERE material_type IS NOT NULL AND material_type != ''
    `;
    
    const [results] = await pool.query(query);
    res.json({ totalMaterialTypes: results[0].totalMaterialTypes });
  } catch (err) {
    console.error('Error fetching material types count:', err.message);
    res.status(500).json({ error: 'Failed to fetch material types count' });
  }
});

/**
 * Get BOM items by style IDs
 */
router.get('/bom/by-styles', verifyToken, async (req, res) => {
  try {
    const { styleIds } = req.query;
    
    if (!styleIds) {
      return res.json([]);
    }
    
    const ids = styleIds.split(',');
    
    const placeholders = ids.map(() => '?').join(',');
    
    const query = `
      SELECT 
        b.id,
        s.style_number,
        b.material_type,
        b.material_description,
        b.quantity_required,
        b.unit,
        b.sourcing_location,
        b.created_at
      FROM bom b
      JOIN styles s ON b.style_id = s.id
      WHERE b.style_id IN (${placeholders})
      ORDER BY b.created_at DESC
    `;
    
    const [results] = await pool.query(query, ids);
    res.json(results);
  } catch (err) {
    console.error('Error fetching BOM by style IDs:', err.message);
    res.status(500).json({ error: 'Failed to fetch BOM by style IDs' });
  }
});

/**
 * Get procurement status for dashboard
 */
router.get('/procurement-status', verifyToken, async (req, res) => {
  try {
    // Fabric status query
    const fabricQuery = `
      SELECT
        (SELECT COUNT(*) FROM pr_fabric WHERE id NOT IN (SELECT pr_fabric_id FROM po_fabric)) AS pendingPR,
        (SELECT COUNT(*) FROM po_fabric WHERE approval_status = 'Pending') AS pendingPO,
        (SELECT COUNT(*) FROM po_fabric WHERE approval_status = 'Approved' AND NOW() < expected_delivery_date) AS inDelivery,
        (SELECT COUNT(*) FROM pr_fabric) AS total,
        (SELECT COUNT(*) FROM po_fabric WHERE approval_status = 'Approved') AS completed
    `;
    
    // Accessories status query
    const accessoriesQuery = `
      SELECT
        (SELECT COUNT(*) FROM pr_accessories WHERE id NOT IN (SELECT pr_accessory_id FROM po_accessories)) AS pendingPR,
        (SELECT COUNT(*) FROM po_accessories WHERE approval_status = 'Pending') AS pendingPO,
        (SELECT COUNT(*) FROM po_accessories WHERE approval_status = 'Approved' AND NOW() < expected_delivery_date) AS inDelivery,
        (SELECT COUNT(*) FROM pr_accessories) AS total,
        (SELECT COUNT(*) FROM po_accessories WHERE approval_status = 'Approved') AS completed
    `;
    
    // Execute queries
    const [fabricResults] = await pool.query(fabricQuery);
    const [accessoriesResults] = await pool.query(accessoriesQuery);
    
    res.json({
      fabric: fabricResults[0],
      accessories: accessoriesResults[0]
    });
  } catch (err) {
    console.error('Error fetching procurement status:', err.message);
    res.status(500).json({ error: 'Failed to fetch procurement status' });
  }
});

/**
 * Get upcoming deliveries
 */
router.get('/upcoming-deliveries', verifyToken, async (req, res) => {
  try {
    // Fabric deliveries query
    const fabricQuery = `
      SELECT 
        pf.fabric_type,
        pf.finalized_quantity AS quantity,
        'meters' AS unit,
        pf.supplier_name,
        pf.expected_delivery_date
      FROM po_fabric pf
      WHERE 
        pf.approval_status = 'Approved' 
        AND pf.expected_delivery_date >= CURDATE()
      ORDER BY pf.expected_delivery_date
      LIMIT 10
    `;
    
    // Accessories deliveries query
    const accessoriesQuery = `
      SELECT 
        pa.accessories_type AS accessory_name,
        pa.finalized_quantity AS quantity,
        'pcs' AS unit,
        pa.vendor_details AS vendor_name,
        pa.expected_delivery_date
      FROM po_accessories pa
      WHERE 
        pa.approval_status = 'Approved' 
        AND pa.expected_delivery_date >= CURDATE()
      ORDER BY pa.expected_delivery_date
      LIMIT 10
    `;
    
    // Execute queries
    const [fabricResults] = await pool.query(fabricQuery);
    const [accessoriesResults] = await pool.query(accessoriesQuery);
    
    res.json({
      fabric: fabricResults,
      accessories: accessoriesResults
    });
  } catch (err) {
    console.error('Error fetching upcoming deliveries:', err.message);
    res.status(500).json({ error: 'Failed to fetch upcoming deliveries' });
  }
});

/**
 * Get list of all buyers
 */
router.get('/buyers', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT buyer_name
      FROM styles
      WHERE buyer_name IS NOT NULL AND buyer_name != ''
      ORDER BY buyer_name
    `;
    
    const [results] = await pool.query(query);
    const buyers = results.map(row => row.buyer_name);
    
    res.json({ buyers });
  } catch (err) {
    console.error('Error fetching buyers:', err.message);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

/**
 * Get trim entries (optionally filtered by buyer)
 */
router.get('/trims', verifyToken, async (req, res) => {
  try {
    const { buyer } = req.query;
    
    let query = `
      SELECT 
        s.style_number,
        s.style_name,
        s.buyer_name,
        b.material_type,
        b.material_description,
        b.quantity_required,
        b.unit
      FROM bom b
      JOIN styles s ON b.style_id = s.id
      WHERE 
        (b.material_type LIKE '%trim%' OR 
         b.material_type LIKE '%button%' OR 
         b.material_type LIKE '%zipper%' OR
         b.material_type LIKE '%packaging%' OR
         b.material_type LIKE '%fabric%' OR
         b.material_type LIKE '%accessories%' OR
         b.material_type = 'Trim' OR
         b.material_type = 'Button' OR
         b.material_type = 'Zipper' OR
         b.material_type = 'Packaging' OR
         b.material_type = 'Fabric')
    `;
    
    const queryParams = [];
    
    // Add buyer filter if specified
    if (buyer && buyer !== 'all') {
      query += ' AND s.buyer_name = ?';
      queryParams.push(buyer);
    }
    
    query += ' ORDER BY s.buyer_name, s.style_number';
    
    const [results] = await pool.query(query, queryParams);
    
    // Log the results for debugging
    console.log(`Found ${results.length} trim entries${buyer && buyer !== 'all' ? ` for buyer: ${buyer}` : ''}`);
    
    res.json(results);
  } catch (err) {
    console.error('Error fetching trim entries:', err.message);
    res.status(500).json({ error: 'Failed to fetch trim entries' });
  }
});

router.get('/unified-tracking', verifyToken, async (req, res) => {
  try {
    const { sampleTypes, buyers } = req.query;
    
    let query = `
      SELECT 
        s.id AS style_id,
        s.style_number,
        s.style_name,
        s.buyer_name,
        s.sample_type,
        s.expected_completion_date,
        (SELECT COUNT(*) FROM bom WHERE style_id = s.id) AS bom_items_count,
        (SELECT GROUP_CONCAT(DISTINCT material_type SEPARATOR ', ') FROM bom WHERE style_id = s.id) AS material_types,
        (SELECT COUNT(*) FROM pr_fabric WHERE style_id = s.id) AS prf_count,
        (SELECT GROUP_CONCAT(DISTINCT fabric_type SEPARATOR ', ') FROM pr_fabric WHERE style_id = s.id) AS fabric_types,
        (SELECT GROUP_CONCAT(DISTINCT color SEPARATOR ', ') FROM pr_fabric WHERE style_id = s.id) AS fabric_colors,
        (SELECT COUNT(*) FROM pr_accessories WHERE style_id = s.id) AS pra_count,
        (SELECT GROUP_CONCAT(DISTINCT accessory_name SEPARATOR ', ') FROM pr_accessories WHERE style_id = s.id) AS accessory_names,
        (SELECT GROUP_CONCAT(DISTINCT colors SEPARATOR ', ') FROM pr_accessories WHERE style_id = s.id) AS accessory_colors,
        (SELECT COUNT(*) 
         FROM po_fabric pof 
         JOIN pr_fabric prf ON pof.pr_fabric_id = prf.id 
         WHERE prf.style_id = s.id) AS pof_count,
        (SELECT GROUP_CONCAT(DISTINCT pof.approval_status SEPARATOR ', ') 
         FROM po_fabric pof 
         JOIN pr_fabric prf ON pof.pr_fabric_id = prf.id 
         WHERE prf.style_id = s.id) AS fabric_approval_status,
        (SELECT COUNT(*) 
         FROM po_accessories poa 
         JOIN pr_accessories pra ON poa.pr_accessory_id = pra.id 
         WHERE pra.style_id = s.id) AS poa_count,
        (SELECT GROUP_CONCAT(DISTINCT poa.approval_status SEPARATOR ', ') 
         FROM po_accessories poa 
         JOIN pr_accessories pra ON poa.pr_accessory_id = pra.id 
         WHERE pra.style_id = s.id) AS accessories_approval_status,
        (SELECT COUNT(*) 
         FROM grn g 
         WHERE g.style_id = s.id
        ) AS grn_count,
        CASE
          WHEN (SELECT COUNT(*) FROM bom WHERE style_id = s.id) = 0 THEN 'BOM Pending'
          WHEN (SELECT COUNT(*) FROM pr_fabric WHERE style_id = s.id) = 0 
               AND (SELECT COUNT(*) FROM pr_accessories WHERE style_id = s.id) = 0 THEN 'PR Pending'
          WHEN NOT EXISTS (
            SELECT 1 FROM po_fabric pof 
            JOIN pr_fabric prf ON pof.pr_fabric_id = prf.id 
            WHERE prf.style_id = s.id
            UNION
            SELECT 1 FROM po_accessories poa 
            JOIN pr_accessories pra ON poa.pr_accessory_id = pra.id 
            WHERE pra.style_id = s.id
          ) THEN 'PO Pending'
          WHEN EXISTS (
            SELECT 1 FROM po_fabric pof 
            JOIN pr_fabric prf ON pof.pr_fabric_id = prf.id 
            WHERE prf.style_id = s.id AND pof.approval_status = 'Pending'
            UNION
            SELECT 1 FROM po_accessories poa 
            JOIN pr_accessories pra ON poa.pr_accessory_id = pra.id 
            WHERE pra.style_id = s.id AND poa.approval_status = 'Pending'
          ) THEN 'PO Approval Pending'
          WHEN NOT EXISTS (
            SELECT 1 FROM grn g 
            WHERE g.style_id = s.id
          ) THEN 'GRN Pending'
          ELSE 'Completed'
        END AS procurement_status,
        u.username AS created_by,
        s.created_at
      FROM styles s
      LEFT JOIN users u ON s.user_id = u.id
    `;
    
    const whereConditions = [];
    const queryParams = [];
    
    // Handle multiple sample types
    if (sampleTypes) {
      const sampleTypeArray = sampleTypes.split(',').map(type => type.trim()).filter(type => type);
      if (sampleTypeArray.length > 0) {
        const placeholders = sampleTypeArray.map(() => '?').join(',');
        whereConditions.push(`s.sample_type IN (${placeholders})`);
        queryParams.push(...sampleTypeArray);
      }
    }
    
    // Handle multiple buyers
    if (buyers) {
      const buyerArray = buyers.split(',').map(buyer => buyer.trim()).filter(buyer => buyer);
      if (buyerArray.length > 0) {
        const placeholders = buyerArray.map(() => '?').join(',');
        whereConditions.push(`s.buyer_name IN (${placeholders})`);
        queryParams.push(...buyerArray);
      }
    }
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Add ORDER BY clause
    query += ' ORDER BY s.created_at DESC';
    
    const [results] = await pool.query(query, queryParams);
    res.json(results);
  } catch (err) {
    console.error('Error fetching unified tracking data:', err.message);
    res.status(500).json({ error: 'Failed to fetch unified tracking data' });
  }
});
/**
 * Get a single style by ID with all related data for detailed view
 */
router.get('/style-detail/:id', verifyToken, async (req, res) => {
  try {
    const styleId = req.params.id;
    
    // Get basic style info
    const styleQuery = `
      SELECT 
        s.*,
        u.username as created_by
      FROM styles s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `;
    
    // Get BOM items
    const bomQuery = `
      SELECT * FROM bom WHERE style_id = ?
    `;
    
    // Get PR Fabric items
    const prfQuery = `
      SELECT * FROM pr_fabric WHERE style_id = ?
    `;
    
    // Get PR Accessories items
    const praQuery = `
      SELECT * FROM pr_accessories WHERE style_id = ?
    `;
    
    // Get PO Fabric items
    const pofQuery = `
      SELECT pof.* 
      FROM po_fabric pof
      JOIN pr_fabric prf ON pof.pr_fabric_id = prf.id
      WHERE prf.style_id = ?
    `;
    
    // Get PO Accessories items
    const poaQuery = `
      SELECT poa.*
      FROM po_accessories poa
      JOIN pr_accessories pra ON poa.pr_accessory_id = pra.id
      WHERE pra.style_id = ?
    `;
    
    // Get GRN items related to this style
    // Get GRN items related to this style
const grnQuery = `
SELECT g.*
FROM grn g
WHERE g.style_id = ?
`;

// Execute all queries in parallel
const [styleResults, bomResults, prfResults, praResults, pofResults, poaResults, grnResults] = 
await Promise.all([
  pool.query(styleQuery, [styleId]),
  pool.query(bomQuery, [styleId]),
  pool.query(prfQuery, [styleId]),
  pool.query(praQuery, [styleId]),
  pool.query(pofQuery, [styleId]),
  pool.query(poaQuery, [styleId]),
  pool.query(grnQuery, [styleId])  // Updated to use style_id directly
]);
    
    // Construct response
    const response = {
      style: styleResults[0][0] || null,
      bom: bomResults[0] || [],
      prFabric: prfResults[0] || [],
      prAccessories: praResults[0] || [],
      poFabric: pofResults[0] || [],
      poAccessories: poaResults[0] || [],
      grn: grnResults[0] || []
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching style details:', err.message);
    res.status(500).json({ error: 'Failed to fetch style details' });
  }
});

module.exports = router;