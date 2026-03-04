import { getAllVehicles, getVehiclesBySlug } from '../../models/catalog/vehicle-catalog.js';
import { getSectionsByVehicleSlug } from '../../models/catalog/vehicle-catalog.js';
import { getReviewsByVehicleId } from '../../models/catalog/reviews-model.js';

// Route handler for the course catalog list page
const vehicleCatalogPage = async (req, res) => {
    const vehicles = await getAllVehicles();

    res.render('catalog/list', {
        title: 'Vehicle Catalog',
        vehicles: vehicles
    });
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