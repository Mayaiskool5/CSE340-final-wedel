import db from '../db.js';

/**
 * Helper to generate the ORDER BY clause safely.
 */
const getSortClause = (sortBy) => {
    const sortMap = {
        'make': 'cat.make_name',
        'model': 'cat.model_name',
        'year': 'cat.year DESC',
        'year_desc': 'cat.year DESC',
        'time': "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER"
    };
    return sortMap[sortBy] || sortMap['year_desc'];
};

/**
 * Core function to fetch catalog entries.
 */
const getCatalogData = async (identifier, identifierType = 'slug', sortBy = 'year', filterBy = 'vehicle') => {
    const whereClause = identifierType === 'id' ? 
        (filterBy === 'vehicle' ? 'v.id = $1' : 'm.id = $1') : 
        (filterBy === 'vehicle' ? 'v.slug = $1' : 'm.slug = $1');

    const orderByClause = getSortClause(sortBy);

    const query = `
        SELECT 
            cat.id, cat.make_name, cat.model_name, cat.year,
            v.vehicle_code, v.name as vehicle_display_name, v.description,
            m.first_name as owner_first_name, m.last_name as owner_last_name, 
            m.slug as owner_slug,
            d.name as dept_name, d.code as dept_code
        FROM catalog cat
        JOIN vehicles v ON cat.vehicle_slug = v.slug
        JOIN members m ON cat.member_slug = m.slug
        JOIN departments d ON v.department_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;

    const { rows } = await db.query(query, [identifier]);

    return rows.map(row => ({
        id: row.id,
        make: row.make_name,
        model: row.model_name,
        year: row.year,
        vehicle: {
            code: row.vehicle_code,
            name: row.vehicle_display_name,
            description: row.description
        },
        owner: {
            fullName: `${row.owner_first_name} ${row.owner_last_name}`,
            slug: row.owner_slug
        },
        department: {
            name: row.dept_name,
            code: row.dept_code
        }
    }));
};

const getSectionsByVehicleId = (id, sort) => getCatalogData(id, 'id', sort, 'vehicle');
const getSectionsByVehicleSlug = (slug, sort) => getCatalogData(slug, 'slug', sort, 'vehicle');
const getVehiclesByOwnerId = (id, sort) => getCatalogData(id, 'id', sort, 'owner');
const getVehiclesByOwnerSlug = (slug, sort) => getCatalogData(slug, 'slug', sort, 'owner');

const getAllVehicles = async (isFeatured = false) => {
    let query = `
        SELECT DISTINCT ON (v.slug) 
            v.id, v.make, v.model, v.year, v.price, v.slug, v.featured,
            c.name as category_name,
            i.image_url as main_image
        FROM vehicles v
        LEFT JOIN categories c ON v.category_id = c.id
        LEFT JOIN vehicle_images i ON v.id = i.vehicle_id AND i.is_primary = true
        WHERE v.availability_status = true
    `;
    
    if (isFeatured) {
        query += ` AND v.featured = true`;
    }

    query += ` ORDER BY v.slug, v.year DESC`;
    
    const { rows } = await db.query(query);
    return rows;
};

const getVehiclesBySlug = async (slug) => {
    const query = `
        SELECT v.*, c.name as category_name 
        FROM vehicles v
        LEFT JOIN categories c ON v.category_id = c.id
        WHERE v.slug = $1
    `;
    const { rows } = await db.query(query, [slug]);
    return rows[0] || null; // Returning null is safer for your Controller's 404 check
};

export { getAllVehicles,
        getVehiclesBySlug,
        getSectionsByVehicleId, 
        getSectionsByVehicleSlug, 
        getVehiclesByOwnerId,
        getVehiclesByOwnerSlug 
    };
