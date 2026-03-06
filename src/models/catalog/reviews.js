import db from '../db.js';

// Get all reviews for a specific vehicle with user names
const getReviewsByVehicleId = async (vehicleId) => {
    const sql = `
        SELECT r.*, u.name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.vehicle_id = $1
        ORDER BY r.created_at DESC`;
    
    const result = await db.query(sql, [vehicleId]);
    return result.rows;
};

// Add a new review to the database
const addReview = async (data) => {
    const sql = `
        INSERT INTO reviews (vehicle_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;
    const result = await db.query(sql, [
        data.vehicle_id, 
        data.user_id, 
        data.rating, 
        data.comment
    ]);
    return result.rows[0];
};

//Update an existing review: Customer only
const updateReview = async (reviewId, userId, rating, comment) => {
    const sql = `
        UPDATE reviews 
        SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING *`;
    const result = await db.query(sql, [rating, comment, reviewId, userId]);
    return result.rows[0];
};

// Delete a review
const deleteReview = async (reviewId, userId = null, isStaff = false) => {
    let sql = 'DELETE FROM reviews WHERE id = $1';
    const params = [reviewId];

    // If not staff, force the user_id check to prevent unauthorized deletion
    if (!isStaff) {
        sql += ' AND user_id = $2';
        params.push(userId);
    }

    const result = await db.query(sql, params);
    return result.rowCount > 0;
};

export { 
    getReviewsByVehicleId, 
    addReview, 
    updateReview, 
    deleteReview 
};
