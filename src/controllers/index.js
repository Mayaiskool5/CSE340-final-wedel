import db from '../models/db.js';

const homePage = async (req, res) => {
    try {
        // Query for featured vehicles (e.g., those marked as 'featured' in DB)
        const sql = `
            SELECT v.*, i.image_url 
            FROM vehicles v
            LEFT JOIN vehicle_images i ON v.id = i.vehicle_id AND i.is_primary = true
            WHERE v.featured = true 
            LIMIT 3`;
        const result = await db.query(sql);
        const featuredVehicles = result.rows.map(v => ({
            id: v.id,
            make: v.make,
            model: v.model,
            description: v.description,
            slug: v.slug,
            image: v.image_url || '/images/no-image.jpg' // Matches <%= vehicle.image %>
        }));

        res.render('home', { 
            title: 'Home', 
            featuredVehicles,
            queryParams: req.query 
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('errors/500', { title: 'Error', error: error.message });
    }
};

export { homePage };