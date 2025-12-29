# 🍹 Horn Dawg Drinks - Complete Website & Admin System

**Production-ready Node.js/Express application** with bilingual support (EN/DE), MySQL database, email queue system, and comprehensive admin panel.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Admin Panel](#-admin-panel)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### **Public Website**
- ✅ Fully responsive bilingual website (English/German)
- ✅ Homepage with product showcase
- ✅ About Us page
- ✅ Contact form
- ✅ Reservation system
- ✅ Thank you page with social sharing
- ✅ Language switcher with session persistence
- ✅ Professional gradient design with animations

### **Backend System**
- ✅ MySQL database with auto-initialization
- ✅ Email queue system (400 emails/hour rate limit)
- ✅ Background email worker
- ✅ Session-based authentication
- ✅ Bcrypt password hashing
- ✅ SQL injection protection

### **Admin Panel**
- ✅ Secure login system
- ✅ Dashboard with statistics
- ✅ Orders management (search, filter, pagination)
- ✅ Product breakdown with analytics
- ✅ Contact messages inbox
- ✅ Bulk Excel upload
- ✅ Price management
- ✅ Email queue monitoring

---

## 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **EJS** | Templating engine |
| **MySQL** | Database |
| **Tailwind CSS** | Styling |
| **Nodemailer** | Email delivery |
| **Bcryptjs** | Password hashing |
| **XLSX** | Excel file processing |
| **Express Session** | Authentication |

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ 
- MySQL 5.7+ or MariaDB 10.3+
- SMTP server access

### **1. Clone & Install**
```bash
cd 2-HORNDAWG_DRINKS
npm install
```

### **2. Create MySQL Database**
```sql
CREATE DATABASE horndawg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **3. Configure Environment**
```bash
cp .env.example .env
nano .env
```

**Required .env variables:**
```env
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=horndawg_db

# Admin Credentials (auto-created on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ADMIN_EMAIL=admin@horndawgdrinks.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Horn Dawg Drinks <noreply@horndawgdrinks.com>

# Security
SESSION_SECRET=generate-random-string-here

# Business Settings
PRODUCT_PRICE=24.99
EMAIL_RATE_LIMIT=400
```

### **4. Add Images**
Copy all product images to `public/images/`:
```
public/images/
├── logo.png
├── flavour_image1.png (Blueberry)
├── flavour_image2.png (Watermelon)
├── flavour_image3.png (Zero Blueberry)
├── flavour_image4.png (Zero Watermelon)
├── flavour_2nd_image1.png (24-pack Blueberry)
├── flavour_2nd_image2.png (24-pack Watermelon)
├── flavour_2nd_image3.png (24-pack Zero Blueberry)
├── flavour_2nd_image4.png (24-pack Zero Watermelon)
├── background.png
└── about_background.png
```

### **5. Start Server**
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### **6. Access**
- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Admin Login:** Use credentials from .env

---

## 📁 Project Structure
```
2-HORNDAWG_DRINKS/
├── server.js                   # Main application
├── package.json               # Dependencies
├── .env                       # Configuration (create this)
│
├── config/
│   ├── database.js           # MySQL setup
│   └── translations.js       # EN/DE translations
│
├── controllers/
│   ├── pageController.js     # Website pages
│   ├── reservationController.js  # Form handling
│   └── adminController.js    # Admin logic
│
├── routes/
│   ├── mainRoutes.js        # Public routes
│   └── adminRoutes.js       # Admin routes
│
├── utils/
│   ├── auth.js              # Authentication
│   └── emailService.js      # Email queue
│
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Header with nav
│   │   ├── footer.ejs       # Footer
│   │   └── admin-nav.ejs    # Admin navigation
│   ├── admin/               # Admin pages
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   ├── orders.ejs
│   │   ├── product-breakdown.ejs
│   │   ├── bulk-upload.ejs
│   │   ├── contact-messages.ejs
│   │   └── settings.ejs
│   ├── index.ejs            # Homepage
│   ├── about.ejs            # About page
│   ├── contact.ejs          # Contact page
│   ├── reservation.ejs      # Reservation form
│   ├── thank-you.ejs        # Thank you page
│   ├── 404.ejs              # 404 error
│   └── 500.ejs              # 500 error
│
└── public/
    └── images/              # Product images
```

---

## ⚙️ Configuration

### **Database Tables** (Auto-created)
- `orders` - Customer reservations
- `contact_messages` - Contact form submissions
- `email_queue` - Email sending queue
- `admin_users` - Admin credentials
- `settings` - App settings (product price)

### **Email System**
- Queue-based sending (respects SMTP limits)
- Background worker processes queue
- Rate: 400 emails/hour (configurable)
- Automatic retry on failure (3 attempts)

### **Language System**
- Session-based language persistence
- Dropdown switcher in header
- Full EN/DE translation coverage
- URL parameter: `?lang=en` or `?lang=de`

---

## 🌐 Deployment

### **Production Deployment (PM2)**

#### **1. Install PM2**
```bash
npm install -g pm2
```

#### **2. Start Application**
```bash
pm2 start server.js --name horndawg-drinks
pm2 startup
pm2 save
```

#### **3. Set up Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

#### **4. Enable SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### **5. Set Production Environment**
```bash
# In .env
NODE_ENV=production
```

### **Quick Deploy Commands**
```bash
# Check status
pm2 status

# View logs
pm2 logs horndawg-drinks

# Restart
pm2 restart horndawg-drinks

# Stop
pm2 stop horndawg-drinks
```

---

## 👨‍💼 Admin Panel

### **Access**
- URL: `http://localhost:3000/admin`
- Credentials: From .env file

### **Features**

#### **1. Dashboard**
- Total orders count
- Total revenue
- Contact messages count
- Email queue status
- Product statistics table

#### **2. Orders Management**
- View all reservations
- Search by name/email/zipcode
- Filter by product
- Pagination (50 per page)
- Export-ready table

#### **3. Product Breakdown**
- Total orders per product
- Total units sold
- Total revenue per product
- Average order value
- Market share visualization

#### **4. Contact Messages**
- View all contact submissions
- Reply via email button
- Pagination
- Timestamp display

#### **5. Bulk Upload**
- Upload Excel (.xlsx) files
- Required columns: Name, Email, Zipcode
- Auto-assigns random products
- Auto-calculates prices
- Adds to email queue

**Excel Format:**
| Name | Email | Zipcode |
|------|-------|---------|
| John Doe | john@example.com | 12345 |

#### **6. Settings**
- Update product price
- View system information
- Database connection status

---

## 📡 API Endpoints

### **Public**
```
GET  /                    Homepage
GET  /about               About page
GET  /contact             Contact page
GET  /reservation         Reservation form
GET  /thank-you           Thank you page
POST /api/reservation     Submit reservation
POST /api/contact         Submit contact form
```

### **Admin** (Requires Authentication)
```
GET  /admin/login            Login page
POST /admin/login            Process login
GET  /admin/logout           Logout
GET  /admin/dashboard        Dashboard
GET  /admin/orders           Orders list
GET  /admin/product-breakdown  Product stats
GET  /admin/contact-messages  Messages inbox
GET  /admin/bulk-upload      Bulk upload page
POST /admin/bulk-upload      Process Excel
GET  /admin/settings         Settings page
POST /admin/settings/price   Update price
```

---

## 🔧 Troubleshooting

### **Server Won't Start**
```bash
# Check MySQL
sudo systemctl status mysql

# Check port 3000
lsof -i :3000

# Kill existing process
kill -9 $(lsof -t -i:3000)
```

### **Database Connection Fails**
```bash
# Test MySQL connection
mysql -h localhost -u root -p

# Check database exists
mysql -u root -p
> SHOW DATABASES;
> USE horndawg_db;
> SHOW TABLES;
```

### **Emails Not Sending**
1. Check SMTP credentials in .env
2. For Gmail: Enable "App Passwords"
3. Check email_queue table:
```sql
SELECT * FROM email_queue WHERE status = 'failed';
```

### **Admin Login Fails**
```bash
# Restart server to recreate admin
npm run dev
```

### **Images Not Loading**
```bash
# Check file permissions
ls -la public/images/

# Fix permissions
chmod 755 public/images/*
```

---

## 📊 Database Maintenance

### **Backup Database**
```bash
mysqldump -u root -p horndawg_db > backup_$(date +%Y%m%d).sql
```

### **Restore Database**
```bash
mysql -u root -p horndawg_db < backup_20241229.sql
```

### **Clear Old Sent Emails** (Optional)
```sql
DELETE FROM email_queue 
WHERE status = 'sent' 
AND sent_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 📈 Performance Tips

1. **Enable Gzip** in Nginx
2. **Use CDN** for static assets
3. **Database Indexing** (already implemented)
4. **Session Store** - Use Redis in production
5. **Image Optimization** - Compress images before upload

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ SQL injection protection (parameterized queries)
- ✅ Session secret in environment variable
- ✅ HTTPS enabled (in production)
- ✅ File upload validation
- ✅ Rate limiting on emails
- ✅ Admin routes protected

---

## 📄 License

Copyright © 2025 Horn Dawg Drinks. All rights reserved.

---

## 🆘 Support

For issues or questions:
1. Check logs: `pm2 logs horndawg-drinks`
2. Check database: `mysql -u root -p horndawg_db`
3. Review .env configuration
4. Verify all images are in place

---

## ✅ Post-Deployment Checklist

- [ ] .env configured with real values
- [ ] MySQL database created
- [ ] All images copied to public/images/
- [ ] SMTP credentials tested
- [ ] Admin login works
- [ ] Reservation form tested
- [ ] Email queue processing
- [ ] Contact form works
- [ ] All pages render correctly
- [ ] Language switcher works
- [ ] SSL certificate installed (production)
- [ ] PM2 configured (production)
- [ ] Database backups scheduled (production)

---

**🎉 Ready to Launch!**

Start your server and visit http://localhost:3000