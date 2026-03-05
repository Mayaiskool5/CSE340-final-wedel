// Create a router instance and export it for use in server.js
import { vehicleCatalogPage, vehicleDetailPage } from './catalog/vehicle-catalog.js';
import { homePage } from './index.js';
import { vehicleListPage } from './vehicles/vehicle.js';
import contactRoutes, { handleContactSubmission } from './forms/contact.js';
import loginRoutes, { processLogin, processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';
import { processReview } from '../controllers/reviews-controller.js';
import { 
    showRegistrationForm, 
    processRegistration, 
    showAllUsers, 
    showEditAccountForm, 
    processEditAccount, 
    processDeleteAccount 
} from './forms/registration.js';

import { Router } from 'express';

// Import Validation Rules from Middleware
import { 
    loginValidation, 
    registrationValidation, 
    editValidation,
    contactValidation 
} from '../middleware/validation/forms.js';
// Import ValidationRules form Middleware

const router = Router();

// Add specific style to all
router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

// Define the POST handler specifically for /contact with validation first
router.post('/contact', contactValidation, handleContactSubmission);

// Contact form routes
router.use('/contact', contactRoutes);

router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

// GET the form
router.get('/register', showRegistrationForm);

// POST the form (Validation + Handler)
router.post('/register', registrationValidation, processRegistration);

// User List
router.get('/register/list', requireLogin, showAllUsers);

router.post('/reviews/add', requireLogin, processReview);

// Edit Account (GET and POST)
router.get('/register/:id/edit', showEditAccountForm);
router.post('/register/:id/edit', editValidation, processEditAccount);

// Delete Account
router.post('/register/:id/delete', processDeleteAccount);

// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

// Login routes (form and submission)
router.use('/login', loginRoutes);

router.post('/login', loginValidation, processLogin);

// Validation rules for registration form
router.use('/register', editValidation);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

// Home page
router.get('/', homePage);

// Vehicle catalog routes
router.get('/browse/:category?', vehicleListPage);
router.get('/vehicle/:slugId', vehicleDetailPage);

// Vehicle directory routes
router.get('/vehicle', vehicleListPage);

export default router;