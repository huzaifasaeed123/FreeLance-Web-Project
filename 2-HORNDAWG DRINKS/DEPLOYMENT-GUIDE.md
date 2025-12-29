# Horn Dawg Drinks - Complete Backend System
## Production-Ready Node.js/Express Application with Email Queue & Admin Panel

---

## 📦 Package Contents

```
backend/
├── server.js                    # Main application server
├── package.json                 # Dependencies
├── .env.example                 # Environment configuration template
├── setup.sh                     # Automated setup script
├── README.md                    # This file
│
├── config/
│   └── database.js             # MySQL connection & table initialization
│
├── controllers/
│   ├── pageController.js       # Main website pages
│   ├── reservationController.js # Form submissions
│   └── adminController.js      # Admin panel logic
│
├── routes/
│   ├── mainRoutes.js          # Public routes
│   └── adminRoutes.js         # Admin routes (protected)
│
├── utils/
│   ├── auth.js                # Authentication & authorization
│   └── emailService.js        # Email queue & background worker
│
├── scripts/
│   └── convert-html-to-ejs.js # HTML to EJS conversion tool
│
├── views/                      # EJS templates
│   ├── partials/
│   │   ├── header.ejs         # Shared header
│   │   ├── footer.ejs         # Shared footer
│   │   └── admin-nav.ejs      # Admin navigation
│   ├── admin/
│   │   ├── login.ejs          # Admin login
│   │   ├── dashboard.ejs      # Admin dashboard
│   │   ├── orders.ejs         # Orders management
│   │   ├── product-breakdown.ejs # Product statistics
│   │   ├── bulk-upload.ejs    # Excel upload
│   │   ├── contact-messages.ejs # Contact form submissions
│   │   └── settings.ejs       # Settings page
│   ├── index.ejs              # Homepage
│   ├── about.ejs              # About page
│   ├── contact.ejs            # Contact page
│   ├── reservation.ejs        # Reservation form
│   ├── thank-you.ejs          # Thank you page
│   ├── 404.ejs                # Not found
│   └── 500.ejs                # Server error
│
└── public/                     # Static files
    ├── images/                # Product images & logo
    ├── css/
    └── js/
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MySQL 5.7+ or MariaDB 10.3+
- SMTP server access (for emails)

### Installation Steps

1. **Extract the backend folder** to your desired location

2. **Install dependencies:**
```bash
cd backend
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Required .env configuration:
```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=horndawg_db

# Admin (will be created automatically)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ADMIN_EMAIL=admin@horndawgdrinks.com

# SMTP (for sending emails)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=Horn Dawg Drinks <noreply@horndawgdrinks.com>

# Security
SESSION_SECRET=generate-a-random-string-here

# Business Settings
PRODUCT_PRICE=24.99
EMAIL_RATE_LIMIT=400
```

4. **Create MySQL database:**
```sql
CREATE DATABASE horndawg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Copy your HTML files** to the parent directory (one level up from backend/) with these names:
   - index.html
   - about.html
   - contact.html
   - reservation.html
   - thank-you.html

6. **Convert HTML to EJS:**
```bash
node scripts/convert-html-to-ejs.js
```

7. **Copy all images** to `public/images/`:
```bash
cp /path/to/your/images/* public/images/
```

Required images:
- logo.png
- flavour_image1.png through flavour_image4.png
- flavour_2nd_image1.png through flavour_2nd_image4.png
- background.png
- about_background.png

8. **Start the server:**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

---

## 🌐 Access Points

- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

**Default Admin Credentials:**
- Username: (from .env ADMIN_USERNAME)
- Password: (from .env ADMIN_PASSWORD)

---

## 📧 Email System

### How It Works
1. When a user submits a reservation, the order is saved to database
2. An email is added to the queue with status 'pending'
3. A background worker processes emails at configured rate (default: 400/hour)
4. Each email is sent via SMTP and marked as 'sent' or 'failed'

### Configuration
- Edit `EMAIL_RATE_LIMIT` in .env (emails per hour)
- System automatically sends 1 email every 9 seconds (for 400/hour)
- Failed emails are retried up to 3 times

### Monitoring
Check email queue status in Admin Dashboard

---

## 👤 Admin Panel Features

### 1. Dashboard
- Total orders, revenue, messages
- Email queue statistics
- Product breakdown by sales

### 2. Orders Management
- View all reservations in paginated table
- Search by name, email, or zipcode
- Filter by product type
- Shows: Name, Email, Product, Quantity, Total Price, Date

### 3. Product Breakdown
- Automatic calculation of:
  - Total orders per product
  - Total units sold
  - Total revenue per product
  - Average order value

### 4. Contact Messages
- View all contact form submissions
- Paginated list with search

### 5. Bulk Upload
- Upload Excel (.xlsx) file with columns: Name, Email, Zipcode
- System automatically assigns random products & quantities
- All uploads added to email queue

**Excel Format:**
| Name | Email | Zipcode |
|------|-------|---------|
| John Doe | john@example.com | 12345 |

### 6. Settings
- Update product price (applies to all new orders)
- Price stored in database (not hardcoded)

---

## 🗄️ Database Structure

### Tables Created Automatically:

**orders**
- id, name, email, zipcode, product, quantity, total_price, created_at

**contact_messages**
- id, name, email, subject, message, created_at

**email_queue**
- id, order_id, recipient_email, subject, html_content, status, attempts, sent_at, created_at

**admin_users**
- id, username, password (hashed), email, created_at

**settings**
- id, setting_key, setting_value, updated_at

---

## 🔒 Security Features

✅ Passwords hashed with bcrypt
✅ Session-based authentication
✅ SQL injection protection (parameterized queries)
✅ File upload validation
✅ Rate limiting on emails
✅ CSRF protection ready
✅ Environment variables for sensitive data

---

## 📊 API Endpoints

### Public Endpoints:
```
GET  /                  - Homepage
GET  /about             - About page
GET  /contact           - Contact page
GET  /reservation       - Reservation form
GET  /thank-you         - Thank you page

POST /api/reservation   - Submit reservation
POST /api/contact       - Submit contact form
```

### Admin Endpoints (require authentication):
```
GET  /admin/login       - Admin login page
POST /admin/login       - Process login
GET  /admin/logout      - Logout
GET  /admin/dashboard   - Dashboard
GET  /admin/orders      - View orders
GET  /admin/product-breakdown - Product statistics
GET  /admin/contact-messages - Contact messages
GET  /admin/bulk-upload - Bulk upload page
POST /admin/bulk-upload - Process Excel upload
GET  /admin/settings    - Settings page
POST /admin/settings/price - Update product price
```

---

## 🐛 Troubleshooting

### Server won't start
- Check MySQL is running: `sudo systemctl status mysql`
- Verify .env database credentials
- Check port 3000 is available: `lsof -i :3000`

### Emails not sending
- Verify SMTP credentials in .env
- Check email_queue table for status
- Review server logs for errors
- Test SMTP connection manually

### Admin login fails
- Ensure database is initialized
- Check admin_users table exists
- Verify .env has ADMIN_USERNAME and ADMIN_PASSWORD
- Restart server to recreate admin user

### Database connection errors
- Confirm MySQL/MariaDB is running
- Test connection: `mysql -h localhost -u user -p`
- Verify database exists
- Check user has proper permissions

### Images not showing
- Ensure images are in `public/images/`
- Check file permissions
- Verify filenames match exactly

---

## 🚀 Production Deployment

### 1. Use Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name horndawg
pm2 startup
pm2 save
```

### 2. Set up Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable HTTPS with Let's Encrypt
```bash
sudo certbot --nginx -d your-domain.com
```

### 4. Set Environment to Production
```env
NODE_ENV=production
```

### 5. Database Backups
```bash
# Daily backup cron job
0 2 * * * mysqldump -u user -p password horndawg_db > /backups/horndawg_$(date +\%Y\%m\%d).sql
```

---

## 📝 Maintenance

### View Logs
```bash
pm2 logs horndawg
```

### Restart Server
```bash
pm2 restart horndawg
```

### Database Maintenance
```sql
-- Check email queue
SELECT status, COUNT(*) FROM email_queue GROUP BY status;

-- Clear old sent emails (optional)
DELETE FROM email_queue WHERE status = 'sent' AND sent_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 🆘 Support

### Check Server Status
```bash
pm2 status
pm2 monit
```

### View Database
```bash
mysql -u user -p horndawg_db
```

### Test Email System
Check Admin Dashboard → Email Statistics

---

## 📄 License

Copyright © 2025 Horn Dawg Drinks. All rights reserved.

---

## ✅ Post-Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] .env configured with real values
- [ ] MySQL database created
- [ ] HTML files converted to EJS
- [ ] Images copied to public/images/
- [ ] SMTP credentials tested
- [ ] Admin login works
- [ ] Reservation form submits correctly
- [ ] Email queue is processing
- [ ] Contact form works
- [ ] All pages render correctly
- [ ] Product price can be updated
- [ ] Bulk upload tested
- [ ] SSL certificate installed (production)
- [ ] PM2 configured (production)
- [ ] Database backups scheduled (production)

---

**Need Help?** Check the troubleshooting section or review server logs.
