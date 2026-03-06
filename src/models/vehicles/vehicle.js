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
    
    // Join vehicles with makes to get make information
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

// Browse vehicles by category name (Trucks, Vans, etc.)
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

// Get all available vehicles with sorting
const getSortedVehicle = async (sortBy = 'make') => {
    // Basic sorting logic
    const orderBy = sortBy === 'price' ? 'v.price DESC' : 
                    sortBy === 'year' ? 'v.year DESC' : 
                    'v.make ASC';

    const query = `
        SELECT v.*, i.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images i ON v.id = i.vehicle_id AND i.is_primary = true
        WHERE v.availability_status = true
        ORDER BY ${orderBy}
    `;
    
    const result = await db.query(query);
    return result.rows;
};


// Create a new vehicle in the inventory
const createVehicle = async (data) => {
    const { make, model, year, price, mileage, specs, description, category_id, slug } = data;
    const query = `
        INSERT INTO vehicles (make, model, year, price, mileage, specs, description, category_id, slug)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
    `;
    const result = await db.query(query, [make, model, year, price, mileage, specs, description, category_id, slug]);
    return result.rows[0];
};

// Delete a vehicle and its assiciated images
const deleteVehicle = async (id) => {
    return await db.query('DELETE FROM vehicles WHERE id = $1', [id]);
};

// Search vehicles by a single word across multiple columns (make, model, year)
const searchVehicles = async (term) => {
    const query = `
        SELECT v.*, i.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images i ON v.id = i.vehicle_id AND i.is_primary = true
        WHERE (v.make ILIKE $1 OR v.model ILIKE $1 OR v.year::text ILIKE $1)
        AND v.availability_status = true
        ORDER BY v.year DESC
    `;
    const result = await db.query(query, [`%${term}%`]); // % are wildcards
    return result.rows;
};


const getVehicleById = (id) => getVehicle(id, 'id');
const getVehicleBySlug = (slug) => getVehicle(slug, 'slug');

export { 
    getVehicleById, 
    getVehicleBySlug, 
    getVehiclesByCategory,
    getSortedVehicle,
    createVehicle,
    deleteVehicle,
    searchVehicles
};