import db from '../models/db.js';

export const logActivity = async (req, actionType, description) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;
        const ip = req.ip;
        
        await db.query(
            `INSERT INTO activity_logs (user_id, action_type, description, ip_address) 
             VALUES ($1, $2, $3, $4)`,
            [userId, actionType, description, ip]
        );
    } catch (err) {
        console.error("Failed to write activity log:", err);
    }
};
