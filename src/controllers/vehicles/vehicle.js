import { getVehicleBySlug, getSortedVehicle, getVehiclesByCategory } from '../../models/vehicles/vehicle.js';

const vehicleListPage = async (req, res, next) => {
    try {
        const searchTerm = req.query.q; // Access the ?q= parameter
        const { category } = req.params;
        let vehicleList;

        if (searchTerm) {
            vehicleList = await searchVehicles(searchTerm);
        } else if (category) {
            vehicleList = await getVehiclesByCategory(category);
        } else {
            vehicleList = await getSortedVehicle('make');
        }

        res.render('vehicles/list', {
            title: searchTerm ? `Results for "${searchTerm}"` : 'Vehicle Directory',
            vehicles: vehicleList,
            searchTerm: searchTerm || ''
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