import db from '../db.js';

const getReviewsByVehicleId = async (vehicleId) => {
    const sql = `
        SELECT r.*, u.first_name, u.last_name 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.vehicle_id = $1
        ORDER BY r.review_date DESC`;
    
    const result = await db.query(sql, [vehicleId]);
    return result.rows;
};

const addReview = async (data) => {
    const sql = `
        INSERT INTO reviews (vehicle_id, user_id, review_rating, review_text)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;
    const result = await db.query(sql, [
        data.vehicle_id, 
        data.account_id, 
        data.review_rating, 
        data.review_text
    ]);
    return result.rows[0];
};

export { getReviewsByVehicleId, addReview };