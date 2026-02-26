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
    const vehicleSlug = req.params.vehicleSlug;
    const vehicleMember = await getVehicleBySlug(vehicleSlug);

    if (Object.keys(vehicleMember).length === 0) {
        const err = new Error(`Vehicle member ${vehicleSlug} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('vehicles/detail', {
        title: `${vehicleMember.name} - Vehicle Profile`,
        member: vehicleMember
    });
};

export { vehicleListPage, vehicleDetailPage};