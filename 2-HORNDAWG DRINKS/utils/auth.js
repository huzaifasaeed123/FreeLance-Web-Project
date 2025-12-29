const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config();

// Create default admin user from .env
async function createDefaultAdmin() {
    try {
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        const email = process.env.ADMIN_EMAIL;
        
        if (!username || !password || !email) {
            console.log('⚠ Admin credentials not found in .env file');
            return;
        }
        
        // Check if admin already exists
        const [existing] = await pool.query(
            'SELECT id FROM admin_users WHERE username = ?',
            [username]
        );
        
        if (existing.length > 0) {
            console.log('✓ Admin user already exists');
            return;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create admin user
        await pool.query(
            'INSERT INTO admin_users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email]
        );
        
        console.log('✓ Default admin user created successfully');
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

// Verify admin login
async function verifyAdminLogin(username, password) {
    try {
        const [users] = await pool.query(
            'SELECT * FROM admin_users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        return { 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        };
    } catch (error) {
        console.error('Error verifying admin login:', error);
        return { success: false, message: 'Server error' };
    }
}

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.adminUser) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

module.exports = {
    createDefaultAdmin,
    verifyAdminLogin,
    requireAuth
};
