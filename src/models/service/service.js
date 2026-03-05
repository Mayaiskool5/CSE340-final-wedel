import db from '../db.js';

/**
 * Create a new service request
 */
const createServiceRequest = async (userId, data) => {
    const { vehicle_info, service_type, inventory_vehicle_id } = data;
    const query = `
        INSERT INTO service_requests (user_id, vehicle_info, service_type, inventory_vehicle_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const result = await db.query(query, [userId, vehicle_info, service_type, inventory_vehicle_id || null]);
    return result.rows[0];
};

/**
 * Get service history for a specific customer
 */
const getRequestsByUser = async (userId) => {
    const query = `
        SELECT * FROM service_requests 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Update request status (Employee/Owner only)
 */
const updateRequestStatus = async (id, status, notes) => {
    const query = `
        UPDATE service_requests 
        SET status = $1, employee_notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
    `;
    const result = await db.query(query, [status, notes, id]);
    return result.rows[0];
};

export { createServiceRequest, getRequestsByUser, updateRequestStatus };
