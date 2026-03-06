import { getAllVehicles, getVehiclesBySlug } from '../../models/catalog/vehicle-catalog.js';
import { getSectionsByVehicleSlug } from '../../models/catalog/vehicle-catalog.js';
import { getReviewsByVehicleId } from '../../models/catalog/reviews.js';

// Route handler for the course catalog list page
// src/controllers/catalog/vehicle-catalog.js

const vehicleCatalogPage = async (req, res) => {
    try {
        const { category, featured } = req.query; // Check for ?category=Trucks or ?featured=true
        
        let vehicles;
        if (featured === 'true') {
            // Fetch only featured vehicles for the Home Page
            vehicles = await getAllVehicles({ featured: true, limit: 4 });
        } else if (category) {
            // Fetch vehicles by category for the Browse page
            vehicles = await getAllVehicles({ category });
        } else {
            vehicles = await getAllVehicles();
        }

        res.render('catalog/list', {
            title: category ? `${category} Inventory` : 'Vehicle Catalog',
            vehicles: vehicles,
            currentCategory: category || 'All'
        });
    } catch (error) {
        res.status(500).send("Error loading catalog");
    }
};


// Route handler for individual vehicle detail pages
const vehicleDetailPage = async (req, res, next) => {
    try {
        const vehicleSlug = req.params.slugId;
        
        // 1. Fetch the main vehicle data
        const vehicleData = await getVehiclesBySlug(vehicleSlug);

        // 2. Check if the object is empty (per your model's design)
        if (!vehicleData || Object.keys(vehicleData).length === 0) {
            return next(new Error("Vehicle not found"));
        }

        // 1. Fetch related data in parallel for speed
        const [sections, reviews] = await Promise.all([
            getSectionsByVehicleSlug(vehicleSlug, req.query.sort || 'year_desc'),
            getReviewsByVehicleId(vehicleData.id) // Fetch reviews using vehicle ID
        ]);

        // 2. Render everything to the view
        res.render('catalog/detail', {
            title: `${vehicleData.make} ${vehicleData.model}`,
            vehicle: vehicleData,
            sections: sections,
            reviews: reviews, // Pass reviews to the EJS
            currentSort: req.query.sort || 'year_desc',
            queryParams: req.query
        });

    } catch (error) {
        next(error);
    }
};

export { vehicleCatalogPage, 
        vehicleDetailPage, 
        getAllVehicles, 
        getVehiclesBySlug, 
        getSectionsByVehicleSlug 
    };