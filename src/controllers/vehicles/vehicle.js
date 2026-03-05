import { getVehicleBySlug, getSortedVehicle, getVehiclesByCategory } from '../../models/vehicles/vehicle.js';

const vehicleListPage = async (req, res, next) => {
    try {
        const { category } = req.params;
        const validSortOptions = ['make', 'model', 'year', 'price'];
        const sortBy = validSortOptions.includes(req.query.sort) ? req.query.sort : 'make';
        
        let vehicleList;
        
        if (category) {
            // Filtered list for category pages (Trucks, SUVs, etc.)
            vehicleList = await getVehiclesByCategory(category);
        } else {
            // General list for the main "Browse" page
            vehicleList = await getSortedVehicle(sortBy);
        }

        res.render('vehicles/list', {
            title: category ? `${category} Inventory` : 'Vehicle Directory',
            vehicles: vehicleList,
            currentSort: sortBy,
            currentCategory: category || 'All'
        });
    } catch (error) {
        next(error);
    }
};

const vehicleDetailPage = async (req, res, next) => {
    try{
        const vehicleSlug = req.params.slugId;
        const vehicleMember = await getVehicleBySlug(vehicleSlug);

        if (!vehicleMember) {
            const err = new Error(`Vehicle member ${vehicleSlug} not found`);
            err.status = 404;
            return next(err);
        }

        res.render('vehicles/detail', {
            title: `${vehicleMember.make} ${vehicleMember.model} - Vehicle Profile`,
            vehicle: vehicleMember,
            sections: [],
            queryParams: req.query,
            currentSort: req.query.sort || 'year'
        });

    } catch (error) {
        console.error("Error in vehicleDetailPage:", error);
        next(error); 
    }
};

export { vehicleListPage, vehicleDetailPage};