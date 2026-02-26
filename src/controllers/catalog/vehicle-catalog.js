import { getAllVehicles, getvehiclesBySlug } from '../../models/catalog/vehicle-catalog.js';
import { getSectionsByCourseSlug } from '../../models/catalog/vehicle-catalog.js';

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
    const vehicleSlug = req.params.slugId;
    const vehicle = await getvehiclesBySlug(vehicleSlug);

    // Our model returns empty object {} when not found, not null
    // Check if the object is empty using Object.keys()
    if (Object.keys(vehicle).length === 0) {
        const err = new Error(`Vehicle ${vehicleSlug} not found`);
        err.status = 404;
        return next(err);
    }
    
    // Get sections (course offerings) separately from the catalog
    // Pass the sortBy parameter directly to the model - PostgreSQL handles the sorting
    const sortBy = req.query.sort || 'year_desc'; // Default sorting by year descending
    const sections = await getSectionsByCourseSlug(vehicleSlug, sortBy);
    
    res.render('catalog/detail', {
        title: `${vehicle.vehicleCode} - ${vehicle.name}`,
        vehicle: vehicle,
        sections: sections,
        currentSort: sortBy
    });
};

export { vehicleCatalogPage, vehicleDetailPage };