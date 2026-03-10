import db from '../db.js';

// Get all images for a specific vehicle (Gallery)
const getVehicleGallery = async (vehicleId) => {
    const query = `
        SELECT * FROM vehicle_images 
        WHERE vehicle_id = $1 
        ORDER BY is_primary DESC, created_at ASC
    `;
    const result = await db.query(query, [vehicleId]);
    return result.rows;
};

// Add a new image (Owner feature)
const addVehicleImage = async (vehicleId, url, isPrimary = false) => {
    const query = `
        INSERT INTO vehicle_images (vehicle_id, image_url, is_primary)
        VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await db.query(query, [vehicleId, url, isPrimary]);
    return result.rows[0];
};

export { getVehicleGallery, addVehicleImage };
