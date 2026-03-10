import { getVehicleBySlug, getSortedVehicle, getVehiclesByCategory, getFeaturedVehicles, searchVehicles } from '../../models/vehicles/vehicle.js';
import { getReviewsByVehicleId } from '../../models/catalog/reviews.js'; 
import { getVehicleGallery } from '../../models/vehicles/images.js'; 

// Home Page with Featured Vehicles
const homePage = async (req, res, next) => {
    try {
        const featured = await getFeaturedVehicles();
        res.render('index', {
            title: 'Home',
            featured: featured
        });
    } catch (error) {
        next(error);
    }
};

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

        const reviews = await getReviewsByVehicleId(vehicleMember.id);
        const gallery = await getVehicleGallery(vehicleMember.id);

        res.render('vehicles/detail', {
            title: `${vehicleMember.make} ${vehicleMember.model} - Vehicle Profile`,
            vehicle: vehicleMember,
            sections: [],
            reviews: reviews,
            gallery: gallery,
            user: req.session.user || null,
            queryParams: req.query,
            currentSort: req.query.sort || 'year'
        });

    } catch (error) {
        console.error("Error in vehicleDetailPage:", error);
        next(error); 
    }
};

export { homePage, vehicleListPage, vehicleDetailPage};