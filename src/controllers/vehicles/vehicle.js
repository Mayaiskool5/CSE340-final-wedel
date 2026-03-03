import { getVehicleBySlug, getSortedVehicle } from '../../models/vehicles/vehicle.js';

const vehicleListPage = async (req, res) => {
    const validSortOptions = ['name', 'department', 'title'];
    const sortBy = validSortOptions.includes(req.query.sort) ? req.query.sort : 'department';
    const vehicleList = await getSortedVehicle(sortBy);

    res.render('vehicles/list', {
        title: 'Vehicle Directory',
        vehicles: vehicleList,
        currentSort: sortBy
    });
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