// // Controller for main website pages

// exports.home = (req, res) => {
//     res.render('index', { title: 'Home - Horn Dawg Drinks' });
// };

// exports.about = (req, res) => {
//     res.render('about', { title: 'About Us - Horn Dawg Drinks' });
// };

// exports.contact = (req, res) => {
//     res.render('contact', { title: 'Contact Us - Horn Dawg Drinks' });
// };

// exports.reservation = (req, res) => {
//     res.render('reservation', { title: 'Reserve Your Drop - Horn Dawg Drinks' });
// };

// exports.thankYou = (req, res) => {
//     res.render('thank-you', { title: 'Thank You - Horn Dawg Drinks' });
// };
// Controller for main website pages
const translations = require('../config/translations');

// Get current language from session or query, default to 'en'
function getCurrentLanguage(req) {
    if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'de')) {
        req.session.language = req.query.lang;
    }
    return req.session.language || 'en';
}

exports.home = (req, res) => {
    const lang = getCurrentLanguage(req);
    res.render('index', { 
        title: 'Home - Horn Dawg Drinks',
        lang: lang,
        t: translations[lang]
    });
};

exports.about = (req, res) => {
    const lang = getCurrentLanguage(req);
    res.render('about', { 
        title: 'About Us - Horn Dawg Drinks',
        lang: lang,
        t: translations[lang]
    });
};

exports.contact = (req, res) => {
    const lang = getCurrentLanguage(req);
    res.render('contact', { 
        title: 'Contact Us - Horn Dawg Drinks',
        lang: lang,
        t: translations[lang]
    });
};

exports.reservation = (req, res) => {
    const lang = getCurrentLanguage(req);
    res.render('reservation', { 
        title: 'Reserve Your Drop - Horn Dawg Drinks',
        lang: lang,
        t: translations[lang]
    });
};

exports.thankYou = (req, res) => {
    const lang = getCurrentLanguage(req);
    res.render('thank-you', { 
        title: 'Thank You - Horn Dawg Drinks',
        lang: lang,
        t: translations[lang]
    });
};