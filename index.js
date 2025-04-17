require('dotenv').config(); // ✅ Load environment variables

const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ Needed for static file serving
const app = express();

const authRoutes = require('./routes/auth');
const styleRoutes = require('./routes/style');
const bomRoutes = require('./routes/bom');
const prAccessoriesRoutes = require('./routes/pr_accessories');
const prFabricRoutes = require('./routes/pr_fabric');
const poAccessoriesRoutes = require('./routes/po_accessories');
const poFabricRoutes = require('./routes/po_fabric');
const dashboardRoutes = require('./routes/dashboard');
const grnRoutes = require('./routes/grn');

// Debugging: Log the authRoutes object
console.log('authRoutes:', authRoutes);

// ✅ Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request body

// ✅ Static file serving (INTERNSHIP folder renamed to 'public')
app.use(express.static(path.join(__dirname, 'public'))); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes); // Signup and Login APIs
app.use('/api/styles', styleRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/pr-accessories', prAccessoriesRoutes);
app.use('/api/pr-fabric', prFabricRoutes);
app.use('/api/po-accessories', poAccessoriesRoutes);
app.use('/api/po-fabric', poFabricRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/grn', grnRoutes);


// ✅ Test route (optional but useful to check if server runs)
app.get('/', (req, res) => {
  res.send('Garment Trim Tracking API is Running...');
});
app.use(express.static('public'));

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
// If you want to add a specific route for the dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
