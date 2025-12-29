const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const reservationController = require('../controllers/reservationController');

// Main pages
router.get('/', pageController.home);
router.get('/about', pageController.about);
router.get('/contact', pageController.contact);
router.get('/reservation', pageController.reservation);
router.get('/thank-you', pageController.thankYou);

// API endpoints
router.post('/api/reservation', reservationController.submitReservation);
router.post('/api/contact', reservationController.submitContact);

module.exports = router;
