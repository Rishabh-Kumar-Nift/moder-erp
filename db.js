const mysql = require('mysql2');

// ✅ MySQL connection setup
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: '00000000', // replace with your MySQL password
  database: 'garment_procurement_db'
});

// ✅ Correct way to export pool (PROMISE version for async/await)
module.exports = pool.promise();