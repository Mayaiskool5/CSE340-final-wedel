import db from '../models/db.js';

const homePage = async (req, res) => {
    try {
        // Query for featured vehicles (e.g., those marked as 'featured' in DB)
        const sql = "SELECT * FROM vehicles ORDER BY id DESC LIMIT 3"; 
        const result = await db.query(sql);
        const featuredVehicles = result.rows;

        res.render('home', { 
            title: 'Home', 
            featuredVehicles 
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('errors/500', { title: 'Error', error: error.message });
    }
};

export { homePage };