import { getAllVehicles, getVehiclesBySlug, getVehicleDetailBySlug } from '../../models/catalog/vehicle-catalog.js';

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


        res.render('vehicle-catalog/list', {
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
        // Fetch the main vehicle data (with owner and category)
        const vehicleData = await getVehicleDetailBySlug(vehicleSlug);

        if (!vehicleData) {
            return next(new Error("Vehicle not found"));
        }

        // Render the detail page (add sections/reviews as needed)
        res.render('vehicle-catalog/detail', {
            title: `${vehicleData.make} ${vehicleData.model}`,
            vehicle: vehicleData,
            user: req.session.user || null
            // Add sections, reviews, etc. if needed
        });
    } catch (error) {
        res.status(500).send("Error loading vehicle detail");
    }
};

export { vehicleCatalogPage, 
        vehicleDetailPage, 
        getAllVehicles, 
        getVehiclesBySlug, 
        getVehicleDetailBySlug 
    };