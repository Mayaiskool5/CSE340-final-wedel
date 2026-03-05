import db from '../db.js';

/**
 * Core function to get a single vehicle by ID or slug.
 * This pattern (one function with a type parameter) reduces duplicate code.
 * 
 * @param {string|number} identifier - Vehicle ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'id')
 * @returns {Promise<Object>} Vehicle object with make info, or empty object if not found
 */
const getVehicle = async (identifier, identifierType = 'id') => {
    // Build WHERE clause dynamically - search by slug or id
    const whereClause = identifierType === 'slug' ? 'v.slug = $1' : 'v.id = $1';
    
    /**
     * Join vehicle with makes to get make information.
     * Aliases: f = vehicle, d = make (since we want the make name and code).
     */
    const query = `
        SELECT v.*, 
            c.name as category_name, 
            i.image_url
        FROM vehicles v
        LEFT JOIN categories c ON v.category_id = c.id
        -- JOIN the images table to get the PRIMARY photo
        LEFT JOIN vehicle_images i ON v.id = i.vehicle_id AND i.is_primary = true
        WHERE ${whereClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    // Return empty object if vehicle not found
    if (result.rows.length === 0) return null; // Return null for 404 handling
    
    const row = result.rows[0];
    return {
        ...row,
        category: row.category_name,
        image: row.image_url || '/images/no-image.jpg'
    };
};

/**
 * Browsing vehicles by category (Trucks, Vans, etc.) 
 * as per your Public Page requirements.
 */
const getVehiclesByCategory = async (categoryName) => {
    const query = `
        SELECT v.*, i.image_url
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images i ON v.id = i.vehicle_id AND i.is_primary = true
        WHERE c.name = $1 AND v.availability_status = true
    `;
    const result = await db.query(query, [categoryName]);
    return result.rows;
};

const getVehicleById = (id) => getVehicle(id, 'id');
const getVehicleBySlug = (slug) => getVehicle(slug, 'slug');

export { 
    getVehicleById, 
    getVehicleBySlug, 
    getVehiclesByCategory 
};