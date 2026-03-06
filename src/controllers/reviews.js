import { addReview, deleteReview, updateReview } from '../models/catalog/reviews-model.js';

// Adding a new review
const processReview = async (req, res, next) => {
    try {
        const { vehicle_id, vehicle_slug, rating, comment } = req.body;
        const user_id = req.session.user ? req.session.user.id : null;

        if (!user_id) {
            req.flash("error", "Please log in to leave a review.");
            return res.redirect("/login");
        }

        const result = await addReview({ 
            vehicle_id, 
            user_id, 
            rating, 
            comment 
        });

        req.flash("success", result ? "Review posted!" : "Error saving review.");
        res.redirect(`/vehicle/${vehicle_slug}`);
    } catch (error) {
        next(error);
    }
};

// Deleting a review
const processDeleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { vehicle_slug } = req.body;
        const user = req.session.user;

        // Staff (Employee/Owner) can delete any review; Customers only their own.
        const isStaff = ['employee', 'owner'].includes(user.roleName);
        const success = await deleteReview(id, user.id, isStaff);

        req.flash(success ? "success" : "error", success ? "Review removed." : "Permission denied.");
        res.redirect(`/vehicle/${vehicle_slug}`);
    } catch (error) {
        next(error);
    }
};

// Updating an existing review
const processUpdateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment, vehicle_slug } = req.body;
        const user_id = req.session.user.id;

        const result = await updateReview(id, user_id, rating, comment);

        req.flash(result ? "success" : "error", result ? "Review updated!" : "Update failed.");
        res.redirect(`/vehicle/${vehicle_slug}`);
    } catch (error) {
        next(error);
    }
};

export { processReview, 
        processDeleteReview, 
        processUpdateReview };
