# Horn Dawg Drinks Website - Backend System

Complete Node.js/Express backend with EJS templating, MySQL database, email queue system, and admin panel.

## 📁 Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env.example            # Environment variables template
├── config/
│   └── database.js         # Database configuration & initialization
├── controllers/
│   ├── pageController.js   # Main website pages
│   ├── reservationController.js  # Reservation & contact forms
│   └── adminController.js  # Admin panel functionality
├── routes/
│   ├── mainRoutes.js       # Public routes
│   └── adminRoutes.js      # Admin routes
├── utils/
│   ├── auth.js             # Authentication utilities
│   └── emailService.js     # Email queue management
├── views/                   # EJS templates (add all HTML files here)
│   ├── partials/
│   │   ├── header.ejs      # Shared header
│   │   └── footer.ejs      # Shared footer
│   └── admin/              # Admin templates
└── public/                  # Static files
    ├── images/             # Copy all images here
    ├── css/
    └── js/
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=horndawg_db

ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ADMIN_EMAIL=admin@horndawgdrinks.com

SMTP_HOST=smtp.your-host.com
SMTP_PORT=587
SMTP_USER=noreply@horndawgdrinks.com
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=Horn Dawg Drinks <noreply@horndawgdrinks.com>

SESSION_SECRET=change-this-to-random-string
PRODUCT_PRICE=24.99
EMAIL_RATE_LIMIT=400
```

### 3. Create MySQL Database

```sql
CREATE DATABASE horndawg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The application will automatically create all required tables on first run.

### 4. Copy Static Files

Copy all your images to `backend/public/images/`:
- logo.png
- flavour_image1.png through flavour_image4.png
- flavour_2nd_image1.png through flavour_2nd_image4.png
- background.png
- about_background.png

### 5. Convert HTML to EJS Templates

The HTML files need to be converted to EJS:

1. Copy your HTML files to `backend/views/`
2. Replace the header section with: `<%- include('partials/header') %>`
3. Replace the footer section with: `<%- include('partials/footer') %>`
4. Update all asset paths:
   - `images/` → `/images/`
   - `href="index.html"` → `href="/"`
   - `href="about.html"` → `href="/about"`
   - etc.

### 6. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📧 Email System

The email system uses a queue-based approach:

1. When a reservation is submitted, it's added to the `email_queue` table
2. A background worker processes emails at the configured rate (default: 400/hour)
3. This ensures SMTP limits are respected and emails are sent reliably

## 👤 Admin Panel

Access: `http://localhost:3000/admin`

Default credentials (from .env):
- Username: admin
- Password: [from ADMIN_PASSWORD]

### Admin Features:

1. **Dashboard**: Overview statistics
2. **Orders**: View all reservations with search/filter
3. **Product Breakdown**: Automatic calculation of orders by product
4. **Contact Messages**: View customer inquiries
5. **Settings**: Update product price
6. **Bulk Upload**: Upload Excel file with Name, Email, Zipcode columns

### Bulk Upload Excel Format:

| Name          | Email              | Zipcode |
|---------------|--------------------|---------|
| John Doe      | john@example.com   | 12345   |
| Jane Smith    | jane@example.com   | 67890   |

The system will randomly assign products and quantities.

## 🗄️ Database Tables

- **orders**: Customer reservations
- **contact_messages**: Contact form submissions  
- **email_queue**: Email sending queue with status tracking
- **admin_users**: Admin login credentials
- **settings**: Application settings (product price)

## 🔒 Security Features

- Passwords hashed with bcrypt
- Session-based authentication
- SQL injection protection (parameterized queries)
- File upload validation
- Rate limiting on email sending

## 📊 Product Price Management

Admin can update product price from Settings page. The price is stored in database and used for all new orders. Total price is calculated as:

```
Total Price = Product Price × Quantity
```

Where quantity is extracted from selection (e.g., "2x 24x0,33L" = 2 units)

## 🎯 API Endpoints

### Public:
- `POST /api/reservation` - Submit reservation
- `POST /api/contact` - Submit contact form

### Admin (requires authentication):
- All `/admin/*` routes require login

## 🐛 Troubleshooting

**Database connection fails:**
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

**Emails not sending:**
- Check SMTP credentials
- Verify EMAIL_RATE_LIMIT setting
- Check email_queue table for failed emails

**Admin login fails:**
- Ensure .env has ADMIN_USERNAME and ADMIN_PASSWORD
- Check admin_users table was created
- Restart server to create default admin

## 📝 Development Notes

- Email worker runs continuously in background
- Sessions last 24 hours
- File uploads limited to 10MB
- Pagination: 50 items per page
- Email rate: Configurable via .env (default 400/hour)

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use a process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name horndawg
   pm2 startup
   pm2 save
   ```
3. Set up nginx reverse proxy
4. Enable HTTPS
5. Configure secure session cookies
6. Set up database backups
7. Monitor email queue regularly

## 📞 Support

For issues or questions, check the logs or contact the development team.
