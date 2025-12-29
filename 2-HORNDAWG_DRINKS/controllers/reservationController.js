const { pool, getProductPrice } = require('../config/database');
const { addEmailToQueue } = require('../utils/emailService');

// Handle reservation submission
exports.submitReservation = async (req, res) => {
    try {
        const { name, email, zipcode, product, quantity } = req.body;
        
        // Validate required fields
        if (!name || !email || !zipcode || !product || !quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Get product price from settings
        const productPrice = await getProductPrice();
        
        // Extract quantity number (e.g., "2x 24x0,33L" => 2)
        const quantityNum = parseInt(quantity.split('x')[0]);
        const totalPrice = (productPrice * quantityNum).toFixed(2);
        
        // Insert order into database
        const [result] = await pool.query(
            `INSERT INTO orders (name, email, zipcode, product, quantity, total_price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, zipcode, product, quantity, totalPrice]
        );
        
        const orderId = result.insertId;
        
        // Add email to queue
        const orderData = {
            name,
            email,
            product,
            quantity,
            total_price: totalPrice
        };
        
        await addEmailToQueue(orderId, email, orderData);
        
        console.log(`✓ Reservation created: ${name} - ${product} - ${quantity}`);
        
        res.json({ 
            success: true, 
            message: 'Reservation submitted successfully',
            orderId: orderId
        });
        
    } catch (error) {
        console.error('Reservation submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
};

// Handle contact form submission
exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Insert contact message into database
        await pool.query(
            `INSERT INTO contact_messages (name, email, subject, message)
             VALUES (?, ?, ?, ?)`,
            [name, email, subject, message]
        );
        
        console.log(`✓ Contact message received from: ${name} - ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Message sent successfully' 
        });
        
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
};

module.exports = exports;
