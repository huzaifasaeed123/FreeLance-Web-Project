const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const { createDefaultAdmin } = require('./utils/auth');
const { processEmailQueue } = require('./utils/emailService');
const mainRoutes = require('./routes/mainRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Routes
app.use('/', mainRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
// app.use((err, req, res, next) => {
//     console.error('Error:', err);
//     res.status(500).render('500', { 
//         title: 'Server Error',
//         error: process.env.NODE_ENV === 'development' ? err : {}
//     });
// });

// Initialize server
async function startServer() {
    try {
        console.log('🚀 Starting Horn Dawg Drinks Server...\n');
        
        // Initialize database
        await initializeDatabase();
        
        // Create default admin user
        await createDefaultAdmin();
        
        // Start email worker
        processEmailQueue();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`\n✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ Admin panel: http://localhost:${PORT}/admin`);
            console.log('\n📧 Email worker active\n');
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
