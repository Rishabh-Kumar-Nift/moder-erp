require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Auth Header:", authHeader);

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("No token provided");
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, authData) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log("Token verified successfully");
    req.authData = authData;
    next();
  });
}

module.exports = verifyToken;
