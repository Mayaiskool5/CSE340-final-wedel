import { addReview } from '../models/catalog/reviews-model.js';

const processReview = async (req, res, next) => {
    try {
        const { vehicle_id, vehicle_slug, review_rating, review_text } = req.body;
        
        const account_id = req.session.accountData ? req.session.accountData.account_id : null;

        if (!account_id) {
            req.flash("notice", "Please log in to leave a review.");
            return res.redirect("/login");
        }
        
        // Save to database
        const reviewData = {
            vehicle_id,
            account_id,
            review_rating,
            review_text
        };

        const result = await addReview(reviewData);

        if (result) {
            req.flash("notice", "Thank you! Your review has been posted.");
            res.redirect(`/vehicles/${vehicle_slug}`); // Redirect back to the car page
        } else {
            req.flash("notice", "Sorry, the review could not be saved.");
            res.redirect(`/vehicles/${vehicle_slug}`);
        }
    } catch (error) {
        console.error("Review Processing Error:", error);
        next(error);
    }
};

export { processReview };