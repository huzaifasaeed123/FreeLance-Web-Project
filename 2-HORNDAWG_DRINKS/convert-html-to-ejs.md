# HTML to EJS Conversion Guide

## Steps to Convert Each HTML File

### 1. Extract Header (from opening <html> to end of </nav>)
Replace with: `<%- include('partials/header') %>`

### 2. Extract Footer (from <footer> to closing </html>)
Replace with: `<%- include('partials/footer') %>`

### 3. Update All Links
- `index.html` → `/`
- `about.html` → `/about`
- `contact.html` → `/contact`
- `reservation.html` → `/reservation`
- `thank-you.html` → `/thank-you`
- `images/` → `/images/`

### 4. Add Custom Styles
Keep the `<style>` tags between header include and main content.

### 5. Update Form Actions
- Reservation form: Keep `/api/reservation`
- Contact form: Change to `/api/contact`
- Add redirect on success to backend route
