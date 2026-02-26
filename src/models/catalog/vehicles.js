import db from '../db.js';

/**
 * Get all vehicles from the database with optional sorting.
 * 
 * @param {string} sortBy - Sort option: 'make' (default), 'name', 'course_code'
 * @returns {Promise<Array>} Array of vehicle objects with vehicle information
 */
const getAllVehicles = async (sortBy = 'make') => {
    /**
     * Build ORDER BY clause based on sortBy parameter.
     * When sorting by vehicle, also sort by vehicle_code within each department.
     */
    const orderByClause = sortBy === 'make' ? 'c.make' :
                          sortBy === 'vehicle_code' ? 'c.vehicle_code' :
                          'd.name, c.vehicle_code';
    
    /**
     * JOIN with departments to get department name and code.
     * Using table aliases (c for courses, d for departments) keeps queries readable.
     */
    const query = `
        SELECT c.id, c.vehicle_code, c.name, c.make, c.year, c.slug,
               d.name as vehicle_name, d.code as make_code
        FROM vehicles c
        JOIN vehicles d ON c.vehicle_id = d.id
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query);
    
    /**
     * Map database rows to JavaScript objects with camelCase property names.
     * This is standard practice for Node.js applications.
     */
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        vehicleCode: vehicle.vehicle_code,
        name: vehicle.name,
        make: vehicle.make,
        year: vehicle.year,
        department: vehicle.vehicle_name,
        departmentCode: vehicle.make_code,
        slug: vehicle.slug
    }));
};

/**
 * Core function to get a single vehicle by ID or slug.
 * Using one function with a parameter reduces code duplication.
 * 
 * @param {string|number} identifier - Vehicle ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'id')
 * @returns {Promise<Object>} Vehicle object with department info, or empty object if not found
 */
const getVehicle = async (identifier, identifierType = 'id') => {
    // Dynamic WHERE clause - search by slug or id depending on identifierType
    const whereClause = identifierType === 'slug' ? 'c.slug = $1' : 'c.id = $1';
    
    const query = `
        SELECT c.id, c.vehicle_code, c.name, c.make, c.year, c.slug,
               d.name as vehicle_name, d.code as make_code
        FROM vehicles c
        JOIN vehicles d ON c.vehicle_id = d.id
        WHERE ${whereClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Return empty object if vehicle not found - this is a common pattern.
     * The calling code can check if the object is empty with Object.keys(result).length
     */
    if (result.rows.length === 0) return {};
    
    const vehicle = result.rows[0];
    return {
        id: vehicle.id,
        vehicleCode: vehicle.vehicle_code,
        name: vehicle.name,
        make: vehicle.make,
        year: vehicle.year,
        department: vehicle.vehicle_name,
        departmentCode: vehicle.make_code,
        slug: vehicle.slug
    };
};

/**
 * Get all vehicles in a specific department.
 * 
 * @param {number} departmentId - The ID of the department
 * @param {string} sortBy - Sort option: 'vehicle_code' (default), 'name', 'department'
 * @returns {Promise<Array>} Array of vehicle objects in the specified department
 */
const getVehiclesByDepartment = async (departmentId, sortBy = 'vehicle_code') => {
    const orderByClause = sortBy === 'name' ? 'c.name' :
                          sortBy === 'department' ? 'd.name, c.vehicle_code' :
                          'c.vehicle_code';
    
    const query = `
        SELECT c.id, c.vehicle_code, c.name, c.description, c.year, c.slug,
               d.name as vehicle_name, d.code as vehicle_code
        FROM vehicles c
        JOIN vehicles d ON c.vehicle_id = d.id
        WHERE c.vehicle_id = $1
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [departmentId]);
    
    return result.rows.map(vehicle => ({
        id: vehicle.id,
        vehicleCode: vehicle.vehicle_code,
        name: vehicle.name,
        description: vehicle.description,
        year: vehicle.year,
        department: vehicle.vehicle_name,
        departmentCode: vehicle.vehicle_code,
        slug: vehicle.slug
    }));
};

/**
 * Get all sections for a specific course, including professor details.
 */
const getVehicleSections = async (vehicleId, sortBy = 'time') => {
    const orderBy = sortBy === 'room' ? 's.room' : 's.time';
    
    const query = `
        SELECT s.id, s.vehicle_id, s.time, s.room, 
               f.name as professor_name, f.slug as professor_slug
        FROM sections s
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE s.vehicle_id = $1
        ORDER BY ${orderBy}
    `;
    
    const result = await db.query(query, [vehicleId]);
    
    return result.rows.map(section => ({
        id: section.id,
        time: section.time,
        room: section.room,
        Vehicle: section.vehicle_name, // Matches your EJS <%= section.Vehicle %>
        vehicleSlug: section.vehicle_slug // Matches your EJS <%= section.vehicleSlug %>
    }));
};

/**
 * Wrapper functions for backward compatibility and cleaner API.
 * Arrow functions work great for simple wrappers like this.
 */
const getVehicleById = (vehicleId) => getVehicle(vehicleId, 'id');
const getVehicleBySlug = (vehicleSlug) => getVehicle(vehicleSlug, 'slug');

export { getAllVehicles, getVehicleById, getVehicleBySlug, getVehiclesByDepartment, getVehicleSections };