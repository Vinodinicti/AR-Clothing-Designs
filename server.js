require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const likeRoutes = require('./routes/likeRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes (allows frontend integration)
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (dashboard.html, dashboard.css, dashboard.js, images, index.html, login.html, etc.)
app.use(express.static(__dirname));

// API Overview Route
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        name: 'AR Clothing & Designs REST API Server',
        status: 'Online',
        version: '1.0.0',
        dashboard: 'http://localhost:5000/dashboard',
        endpoints: {
            auth_login: 'POST /api/auth/login',
            items: 'GET /api/items',
            orders: 'GET /api/orders',
            users: 'GET /api/users',
            cart: 'GET /api/cart',
            likes: 'GET /api/likes'
        }
    });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SQLite Item, Order & User Manager REST API is running smoothly',
        timestamp: new Date().toISOString()
    });
});

// Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/likes', likeRoutes);

// Redirect Admin Login Page requests to /login#admin
app.get(['/admin-login', '/admin/login', '/admin'], (req, res) => {
    res.redirect('/login#admin');
});

// Serve Dashboard HTML at /dashboard and /admin-panel
app.get(['/dashboard', '/admin-panel'], (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve Customer Login Page at /login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve main website at /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// 404 Handler for undefined endpoints
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Initialize DB and Start Server
// Initialize DB
initDb().catch((err) => {
    console.error('❌ Database initialization issue:', err.message);
});

if (require.main === module || !process.env.VERCEL) {
    const server = app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Express SQLite Server running in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`🔑 Admin Login: admin@arclothing.com / admin123`);
        console.log(`📊 Dashboard UI: http://localhost:${PORT}/dashboard`);
        console.log(`🔐 Login Page: http://localhost:${PORT}/login`);
        console.log(`====================================================`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use by another process.`);
        } else {
            console.error('❌ Server error:', err.message);
        }
    });
}

module.exports = app;
