
const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../utils/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

// Public routes
router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);

// Protected routes
router.get('/logout', requireAuth, adminController.logout);
router.get('/dashboard', requireAuth, adminController.dashboard);
router.get('/orders', requireAuth, adminController.orders);
router.get('/product-breakdown', requireAuth, adminController.productBreakdown);
router.get('/settings', requireAuth, adminController.settings);
router.post('/settings/price', requireAuth, adminController.updatePrice);
router.get('/bulk-upload', requireAuth, adminController.bulkUploadPage);
router.post('/bulk-upload', requireAuth, upload.single('file'), adminController.bulkUpload);
router.get('/contact-messages', requireAuth, adminController.contactMessages);

module.exports = router;
