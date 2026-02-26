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
    const whereClause = identifierType === 'slug' ? 'f.slug = $1' : 'f.id = $1';
    
    /**
     * Join vehicle with makes to get make information.
     * Aliases: f = vehicle, d = make (since we want the make name and code).
     */
    const query = `
        SELECT f.id, f.name, f.make, f.model, f.year, 
               f.title, f.gender, f.slug, d.name as make_name, d.code as make_code
        FROM vehicles f
        JOIN makes d ON f.make_id = d.id
        WHERE ${whereClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    // Return empty object if vehicle not found
    if (result.rows.length === 0) return {};
    
    const vehicle = result.rows[0];
    return {
        id: vehicle.id,
        name: vehicle.name, // Computed full name (since we only have one name field in vehicles)
        vehicle: vehicle.make_name,
        vehicleCode: vehicle.make_code,
        vin: vehicle.vin,
        slug: vehicle.slug
    };
};

/**
 * Get all vehicles with optional sorting.
 * 
 * @param {string} sortBy - Sort option: 'make' (default), 'name', 'title'
 * @returns {Promise<Array>} Array of vehicle objects sorted by the specified field
 */
const getSortedVehicle = async (sortBy = 'make') => {
    /**
     * Build ORDER BY clause - notice we sort by names.
     * This is the standard way to alphabetize vehicles names.
     */
    const orderByClause = sortBy === 'name' ? ' f.name' :
                          sortBy === 'title' ? 'f.title, f.name' :
                          'd.name, f.name';
    
    const query = `
        SELECT f.id, f.name, f.vehicle, f.vehicleCode, f.vin, f.slug
        FROM vehicles f
        JOIN makes d ON f.make_id = d.id
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query);
    
    // Transform each row from database format to JavaScript format
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        vehicle: vehicle.vehicle,
        vehicleCode: vehicle.vehicleCode,
        vin: vehicle.vin,
        slug: vehicle.slug
    }));
};

/**
 * Get all vehicles in a specific make.
 * 
 * @param {number} makeId - The ID of the make
 * @param {string} sortBy - Sort option: 'name' (default), 'make', 'year'
 * @returns {Promise<Array>} Array of vehicle objects in the specified make
 */
const getVehiclesByMake = async (makeId, sortBy = 'name') => {
    const orderByClause = sortBy === 'name' ? 'f.name' :
                          sortBy === 'year' ? 'f.year DESC' :
                          'd.name, f.name';
    
    // WHERE clause filters to only vehicles in the specified make
    const query = `
        SELECT f.id, f.name, f.vehicle, f.vehicleCode, f.vin, f.slug
        FROM vehicles f
        JOIN makes d ON f.make_id = d.id
        WHERE f.make_id = $1
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [makeId]);
    
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        vehicle: vehicle.vehicle,
        vehicleCode: vehicle.vehicleCode,
        vin: vehicle.vin,
        slug: vehicle.slug
    }));
};

/**
 * Wrapper functions for cleaner API - these make the code more readable at the call site.
 * Example: getVehicleById(5) is clearer than getVehicle(5, 'id')
 */
const getVehicleById = (vehicleId) => getVehicle(vehicleId, 'id');
const getVehicleBySlug = (vehicleSlug) => getVehicle(vehicleSlug, 'slug');

export { getVehicleById, 
        getVehicleBySlug, 
        getSortedVehicle,
        getVehiclesByMake };