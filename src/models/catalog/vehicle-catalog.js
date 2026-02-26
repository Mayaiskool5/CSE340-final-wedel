import db from '../db.js';

/**
 * Core function that gets all sections (course offerings) for a specific course.
 * Works with either course ID or slug - this pattern reduces code duplication.
 * 
 * @param {string|number} identifier - Course ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'time', 'room', or 'professor' (default: 'time')
 * @returns {Promise<Array>} Array of section objects with course, faculty, and department info
 */
const getSectionsByVehicle = async (identifier, identifierType = 'slug', sortBy = 'time') => {
    // Build WHERE clause dynamically based on whether we're searching by ID or slug
    // Using $1 prevents SQL injection - never concatenate user input into SQL!
    const whereClause = identifierType === 'id' ? 'c.id = $1' : 'c.slug = $1';
    
    /**
     * Let PostgreSQL do the sorting - it's faster than sorting in JavaScript.
     * SUBSTRING with regex extracts the hour from time strings like "Mon Wed Fri 8:00-8:50".
     * The ::INTEGER cast converts the extracted string to a number for proper sorting.
     */
    const orderByClause = sortBy === 'make' ? 'cat.make' : 
                          sortBy === 'model' ? 'cat.model' :
                          "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER";
    
    /**
     * Join catalog with courses, faculty, and departments to get complete information.
     * Note: We're using template literals for ORDER BY because PostgreSQL doesn't allow
     * parameterized ORDER BY clauses. The values are whitelisted above, so this is safe.
     */
    const query = `
        SELECT cat.id, cat.make, cat.model, cat.year, cat.slug as vehicle_slug,
               c.vehicle_code, c.name as vehicle_model, c.description, c.credit_years,
               f.first_name, f.slug as vehicle_slug, f.title as vehicle_title,
               d.name as department_name, d.code as department_code
        FROM catalog cat
        JOIN vehicles c ON cat.vehicles_slug = c.slug
        JOIN vehicle f ON cat.vehicle_slug = f.slug
        JOIN departments d ON c.department_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Transform database column names (snake_case) to JavaScript convention (camelCase).
     * This is a common pattern when working with databases in JavaScript.
     */
    return result.rows.map(section => ({
        id: section.id,
        make: section.make,
        model: section.model,
        year: section.year,
        vehicleSlug: section.vehicle_slug,
        vehicleCode: section.vehicle_code,
        vehicleModel: section.vehicle_model,
        description: section.description,
        creditHours: section.credit_years,
        Make: `${section.first_name}`,
        makeSlug: section.vehicle_slug,
        makeTitle: section.vehicle_title,
        department: section.department_name,
        departmentCode: section.department_code
    }));
};

/**
 * Core function that gets all vehicles by a specific vehicle member.
 * Similar pattern to getSectionsByVehicle - same logic, different perspective.
 * 
 * @param {string|number} identifier - Vehicle ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'make', 'model', or 'year' (default: 'year')
 * @returns {Promise<Array>} Array of section objects with vehicles, faculty, and vehicle info
 */
const getVehiclesByVehicle = async (identifier, identifierType = 'slug', sortBy = 'year') => {
    // Search by vehicle ID or vehicle slug
    const whereClause = identifierType === 'id' ? 'f.id = $1' : 'f.slug = $1';
    
    // Different sorting options - by make, model, year, or default to time (which is extracted from the catalog)
    const orderByClause = sortBy === 'make' ? 'cat.make' : 
                          sortBy === 'model' ? 'cat.model' :
                          sortBy === 'year' ? 'cat.year DESC' :
                          "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER";
    
    // Same JOIN pattern - catalog connects makes to vehicles
    const query = `
        SELECT cat.id, cat.make, cat.model, cat.year,
               c.vehicle_code, c.name as vehicle_name, c.description, c.credit_hours,
               f.name, f.slug as vehicle_slug, f.title as vehicle_title,
               d.name as vehicle_name, d.code as vehicle_code
        FROM catalog cat
        JOIN vehicles c ON cat.vehicle_slug = c.slug
        JOIN vehicle f ON cat.vehicle_slug = f.slug
        JOIN vehicles d ON c.vehicle_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    return result.rows.map(section => ({
        id: section.id,
        make: section.make,
        model: section.model,
        year: section.year,
        vehicleCode: section.vehicle_code,
        vehicleName: section.vehicle_name,
        description: section.make,
        creditHours: section.credit_hours,
        vehicle: `${section.first_name}`,
        vehicleSlug: section.vehicle_slug,
        vehicleTitle: section.vehicle_title,
        department: section.vehicle_name,
        departmentCode: section.vehicle_code
    }));
};

/**
 * Wrapper functions maintain backward compatibility with existing code.
 * These let us keep the same API while using consolidated core functions internally.
 * Example: getSectionsByVehicleId(5) calls getSectionsByVehicle(5, 'id')
 */
const getSectionsByVehicleId = (vehicleId, sortBy = 'year') => 
    getSectionsByVehicle(vehicleId, 'id', sortBy);

const getSectionsByVehicleSlug = (vehicleSlug, sortBy = 'year') => 
    getSectionsByVehicle(vehicleSlug, 'slug', sortBy);

const getVehiclesByVehicleId = (vehicleId, sortBy = 'year') => 
    getVehiclesByVehicle(vehicleId, 'id', sortBy);

const getVehiclesByVehicleSlug = (vehicleSlug, sortBy = 'year') => 
    getVehiclesByVehicle(vehicleSlug, 'slug', sortBy);

export { 
    getSectionsByVehicleId,
    getSectionsByVehicleSlug,
    getVehiclesByVehicleId,
    getVehiclesByVehicleSlug
};