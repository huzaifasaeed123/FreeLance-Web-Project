const nodemailer = require('nodemailer');
const { pool } = require('../config/database');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Verify SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('✓ SMTP server is ready to send emails');
    }
});

// Generate order confirmation email HTML
function generateOrderConfirmationEmail(orderData) {
    const { name, email, product, quantity, total_price } = orderData;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 20px; font-weight: bold; color: #991b1b; margin-top: 20px; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        .emoji { font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 THANK YOU FOR YOUR RESERVATION!</h1>
        </div>
        
        <div class="content">
            <h2>Hi ${name}!</h2>
            <p>You're officially a Horn Dawg, and we're excited to have you on board! 🎊</p>
            <p>We're thrilled to announce that you are now a participant in the <strong>€20,000 Launch Jackpot</strong>.</p>
            
            <div class="order-details">
                <h3>Your Reservation Details:</h3>
                <div class="detail-row">
                    <span><strong>Product:</strong></span>
                    <span>${product}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Quantity:</strong></span>
                    <span>${quantity}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Total Price:</strong></span>
                    <span class="total">€${parseFloat(total_price).toFixed(2)}</span>
                </div>
            </div>
            
            <p class="emoji">👑 Your entry is confirmed.</p>
            <p class="emoji">🍀 Wishing you the best of luck!</p>
            
            <p style="margin-top: 30px;">
                <strong>Important:</strong> This reservation is free and non-binding. 
                A purchase is neither required for participation nor does it increase the chances of winning.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 Horn Dawg Drinks. All rights reserved.</p>
            <p>For questions, visit our website or contact us.</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Add email to queue
async function addEmailToQueue(orderId, recipientEmail, orderData) {
    try {
        const subject = 'Your Horn Dawg Drinks Reservation Confirmation 🎉';
        const htmlContent = generateOrderConfirmationEmail(orderData);
        
        await pool.query(
            `INSERT INTO email_queue (order_id, recipient_email, subject, html_content, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [orderId, recipientEmail, subject, htmlContent]
        );
        
        console.log(`✓ Email queued for ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error adding email to queue:', error);
        return false;
    }
}

// Email worker - sends emails respecting rate limit (400/hour = 1 every 9 seconds)
let isWorkerRunning = false;
const EMAIL_INTERVAL = (3600 / parseInt(process.env.EMAIL_RATE_LIMIT || 400)) * 1000; // milliseconds

async function processEmailQueue() {
    if (isWorkerRunning) return;
    isWorkerRunning = true;
    
    console.log('✓ Email worker started (Rate: ' + process.env.EMAIL_RATE_LIMIT + '/hour)');
    
    setInterval(async () => {
        try {
            // Get next pending email
            const [emails] = await pool.query(
                `SELECT * FROM email_queue 
                 WHERE status = 'pending' 
                 ORDER BY created_at ASC 
                 LIMIT 1`
            );
            
            if (emails.length === 0) return;
            
            const email = emails[0];
            
            // Update attempt count
            await pool.query(
                `UPDATE email_queue 
                 SET attempts = attempts + 1, last_attempt = NOW() 
                 WHERE id = ?`,
                [email.id]
            );
            
            // Send email
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: email.recipient_email,
                    subject: email.subject,
                    html: email.html_content
                });
                
                // Mark as sent
                await pool.query(
                    `UPDATE email_queue 
                     SET status = 'sent', sent_at = NOW() 
                     WHERE id = ?`,
                    [email.id]
                );
                
                console.log(`✓ Email sent to ${email.recipient_email}`);
                
            } catch (sendError) {
                console.error(`✗ Failed to send email to ${email.recipient_email}:`, sendError.message);
                
                // Mark as failed after 3 attempts
                if (email.attempts >= 2) {
                    await pool.query(
                        `UPDATE email_queue 
                         SET status = 'failed', error_message = ? 
                         WHERE id = ?`,
                        [sendError.message, email.id]
                    );
                }
            }
            
        } catch (error) {
            console.error('Email worker error:', error);
        }
    }, EMAIL_INTERVAL);
}

// Get email queue statistics
async function getEmailStats() {
    try {
        const [stats] = await pool.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM email_queue
            GROUP BY status
        `);
        
        const result = {
            pending: 0,
            sent: 0,
            failed: 0
        };
        
        stats.forEach(stat => {
            result[stat.status] = stat.count;
        });
        
        return result;
    } catch (error) {
        console.error('Error fetching email stats:', error);
        return { pending: 0, sent: 0, failed: 0 };
    }
}

module.exports = {
    addEmailToQueue,
    processEmailQueue,
    getEmailStats,
    generateOrderConfirmationEmail
};
