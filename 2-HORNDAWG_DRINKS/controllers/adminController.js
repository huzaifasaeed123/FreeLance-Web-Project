const { pool, getProductPrice, updateProductPrice } = require('../config/database');
const { verifyAdminLogin } = require('../utils/auth');
const { addEmailToQueue, getEmailStats } = require('../utils/emailService');
const XLSX = require('xlsx');

// Show login page
exports.loginPage = (req, res) => {
    if (req.session && req.session.adminUser) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { 
        title: 'Admin Login',
        error: null 
    });
};

// Handle login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(username,password)
    const result = await verifyAdminLogin(username, password);
    
    if (result.success) {
        req.session.adminUser = result.user;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { 
            title: 'Admin Login',
            error: result.message 
        });
    }
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
};

// Dashboard
exports.dashboard = async (req, res) => {
    try {
        // Get statistics
        const [orderStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_price) as total_revenue
            FROM orders
        `);
        
        const [contactStats] = await pool.query(`
            SELECT COUNT(*) as total_messages FROM contact_messages
        `);
        
        const emailStats = await getEmailStats();
        
        // Get product statistics
        const [productStats] = await pool.query(`
            SELECT 
                product,
                COUNT(*) as order_count,
                SUM(total_price) as revenue
            FROM orders
            GROUP BY product
            ORDER BY order_count DESC
        `);
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.adminUser,
            stats: {
                orders: orderStats[0],
                contacts: contactStats[0].total_messages,
                emails: emailStats,
                products: productStats
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.adminUser,
            stats: null,
            error: 'Error loading statistics'
        });
    }
};

// View all orders
exports.orders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        
        const search = req.query.search || '';
        const productFilter = req.query.product || '';
        
        let query = 'SELECT * FROM orders WHERE 1=1';
        let params = [];
        
        if (search) {
            query += ` AND (name LIKE ? OR email LIKE ? OR zipcode LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (productFilter) {
            query += ` AND product = ?`;
            params.push(productFilter);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const [orders] = await pool.query(query, params);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
        let countParams = [];
        
        if (search) {
            countQuery += ` AND (name LIKE ? OR email LIKE ? OR zipcode LIKE ?)`;
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (productFilter) {
            countQuery += ` AND product = ?`;
            countParams.push(productFilter);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const totalOrders = countResult[0].total;
        const totalPages = Math.ceil(totalOrders / limit);
        
        // Get unique products for filter
        const [products] = await pool.query(`
            SELECT DISTINCT product FROM orders ORDER BY product
        `);
        
        res.render('admin/orders', {
            title: 'Orders',
            user: req.session.adminUser,
            orders,
            products: products.map(p => p.product),
            pagination: {
                page,
                totalPages,
                totalOrders
            },
            filters: {
                search,
                product: productFilter
            }
        });
    } catch (error) {
        console.error('Orders page error:', error);
        res.render('admin/orders', {
            title: 'Orders',
            user: req.session.adminUser,
            orders: [],
            products: [],
            error: 'Error loading orders'
        });
    }
};

// View product breakdown
exports.productBreakdown = async (req, res) => {
    try {
        const [breakdown] = await pool.query(`
            SELECT 
                product,
                COUNT(*) as total_orders,
                SUM(CAST(SUBSTRING_INDEX(quantity, 'x', 1) AS UNSIGNED)) as total_units,
                SUM(total_price) as total_revenue,
                AVG(total_price) as avg_order_value
            FROM orders
            GROUP BY product
            ORDER BY total_orders DESC
        `);
        
        const productPrice = await getProductPrice();
        
        res.render('admin/product-breakdown', {
            title: 'Product Breakdown',
            user: req.session.adminUser,
            breakdown,
            productPrice
        });
    } catch (error) {
        console.error('Product breakdown error:', error);
        res.render('admin/product-breakdown', {
            title: 'Product Breakdown',
            user: req.session.adminUser,
            breakdown: [],
            error: 'Error loading breakdown'
        });
    }
};

// Settings page
exports.settings = async (req, res) => {
    try {
        const productPrice = await getProductPrice();
        
        res.render('admin/settings', {
            title: 'Settings',
            user: req.session.adminUser,
            productPrice,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Settings page error:', error);
        res.render('admin/settings', {
            title: 'Settings',
            user: req.session.adminUser,
            productPrice: 24.99,
            error: 'Error loading settings'
        });
    }
};

// Update product price
exports.updatePrice = async (req, res) => {
    try {
        const { price } = req.body;
        const priceNum = parseFloat(price);
        
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.redirect('/admin/settings?error=Invalid price');
        }
        
        await updateProductPrice(priceNum);
        res.redirect('/admin/settings?success=Price updated successfully');
    } catch (error) {
        console.error('Update price error:', error);
        res.redirect('/admin/settings?error=Error updating price');
    }
};

// Bulk upload page
exports.bulkUploadPage = (req, res) => {
    res.render('admin/bulk-upload', {
        title: 'Bulk Upload',
        user: req.session.adminUser,
        success: req.query.success,
        error: req.query.error
    });
};

// Handle bulk upload
exports.bulkUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/admin/bulk-upload?error=No file uploaded');
        }
        
        // Read Excel file
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) {
            return res.redirect('/admin/bulk-upload?error=Empty file');
        }
        
        // Products and quantities for random selection
        const products = ['Watermelon', 'Blueberry', 'Watermelon Zero', 'Blueberry Zero'];
        const quantities = ['1x 24x0,33L', '2x 24x0,33L', '3x 24x0,33L', '4x 24x0,33L'];
        
        const productPrice = await getProductPrice();
        let successCount = 0;
        
        // Process each row
        for (const row of data) {
            try {
                // Expected columns: name, email, zipcode (case-insensitive)
                const name = row.name || row.Name || row.NAME;
                const email = row.email || row.Email || row.EMAIL;
                const zipcode = row.zipcode || row.Zipcode || row.ZIPCODE || row['zip code'] || row['Zip Code'];
                
                if (!name || !email || !zipcode) {
                    console.log('Skipping row due to missing data:', row);
                    continue;
                }
                
                // Random product and quantity
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = quantities[Math.floor(Math.random() * quantities.length)];
                const quantityNum = parseInt(quantity.split('x')[0]);
                const totalPrice = (productPrice * quantityNum).toFixed(2);
                
                // Insert order
                const [result] = await pool.query(
                    `INSERT INTO orders (name, email, zipcode, product, quantity, total_price)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [name, email, zipcode, product, quantity, totalPrice]
                );
                
                // Add email to queue
                const orderData = {
                    name,
                    email,
                    product,
                    quantity,
                    total_price: totalPrice
                };
                
                await addEmailToQueue(result.insertId, email, orderData);
                successCount++;
                
            } catch (rowError) {
                console.error('Error processing row:', rowError);
            }
        }
        
        res.redirect(`/admin/bulk-upload?success=${successCount} orders uploaded successfully`);
        
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.redirect('/admin/bulk-upload?error=Error processing file');
    }
};

// View contact messages
exports.contactMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        
        const [messages] = await pool.query(
            `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM contact_messages`
        );
        
        const totalMessages = countResult[0].total;
        const totalPages = Math.ceil(totalMessages / limit);
        
        res.render('admin/contact-messages', {
            title: 'Contact Messages',
            user: req.session.adminUser,
            messages,
            pagination: {
                page,
                totalPages,
                totalMessages
            }
        });
    } catch (error) {
        console.error('Contact messages error:', error);
        res.render('admin/contact-messages', {
            title: 'Contact Messages',
            user: req.session.adminUser,
            messages: [],
            error: 'Error loading messages'
        });
    }
};

module.exports = exports;
