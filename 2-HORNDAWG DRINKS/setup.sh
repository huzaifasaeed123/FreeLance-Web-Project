#!/bin/bash

# Horn Dawg Drinks - Complete Backend Setup Script
# This script will set up the entire backend system

echo "🚀 Horn Dawg Drinks Backend Setup"
echo "=================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Check for .env file
echo "🔧 Step 2: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your actual configuration before continuing!"
    echo ""
    echo "Required configuration:"
    echo "  - Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)"
    echo "  - Admin credentials (ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL)"
    echo "  - SMTP settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)"
    echo "  - Session secret (SESSION_SECRET)"
    echo ""
    read -p "Press Enter after configuring .env file..."
else
    echo "✅ .env file found"
fi
echo ""

# Step 3: Copy static files
echo "📁 Step 3: Setting up static files..."
if [ -d "../../images" ]; then
    echo "Copying images..."
    cp -r ../../images/* public/images/ 2>/dev/null || true
    echo "✅ Images copied"
else
    echo "⚠️  No images folder found. Please manually copy images to public/images/"
fi
echo ""

# Step 4: Convert HTML to EJS
echo "🔄 Step 4: Converting HTML templates to EJS..."
echo "Please run the conversion script for HTML files:"
echo "  node scripts/convert-html-to-ejs.js"
echo ""

# Step 5: Database setup reminder
echo "🗄️  Step 5: Database setup"
echo "Make sure your MySQL database is running and accessible"
echo "The application will create tables automatically on first run"
echo ""

# Step 6: Final instructions
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Ensure .env is configured with correct values"
echo "2. Make sure MySQL is running"
echo "3. Convert HTML files to EJS (see views/ directory)"
echo "4. Start the server:"
echo "   npm run dev    (development with auto-restart)"
echo "   npm start      (production)"
echo ""
echo "📌 Access points:"
echo "   Website: http://localhost:3000"
echo "   Admin:   http://localhost:3000/admin"
echo ""
echo "📧 Email worker will start automatically"
echo "   Rate limit: 400 emails/hour (configurable in .env)"
echo ""
