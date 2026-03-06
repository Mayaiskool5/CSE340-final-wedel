/**
 * Middleware to require authentication for protected routes.
 * Redirects to login page if user is not authenticated.
 * Sets res.locals.isLoggedIn = true for authenticated requests.
 */
const requireLogin = (req, res, next) => {
    // Check if user is logged in via session; we can beef this up later with roles and permissions
    if (req.session && req.session.user) {
        // User is authenticated - set UI state and continue
        res.locals.isLoggedIn = true;
        res.locals.currentUser = req.session.user;
        next();
    } else {
        // User is not authenticated - redirect to login
        res.locals.isLoggedIn = false;
        res.redirect('/login');
    }
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * 
 * @param {string} roles - The role name required (e.g., 'owner', 'customer')
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        // Ensure 'roles' is always an array so we can use .includes()
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Check against the correct database property: role_name
        const userRole = req.session.user.role_name; 

        if (!allowedRoles.includes(userRole)) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        next();
    };
};


export { requireLogin, requireRole };