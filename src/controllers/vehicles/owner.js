import * as vehicleModel from '../../models/vehicles/vehicle.js';

// Show the form to add a vehicle
const showAddVehicleForm = async (req, res) => {
    const categories = await db.query('SELECT * FROM categories');
    res.render('admin/add-vehicle', { 
        title: 'Add New Inventory', 
        categories: categories.rows 
    });
};

// Process adding the vehicle
const processAddVehicle = async (req, res, next) => {
    try {
        const { make, model, year, price, mileage, description, category_id } = req.body;

        // Bundle specs into a JSON object for the JSONB column
        const specs = {
            engine: req.body.spec_engine,
            transmission: req.body.spec_trans,
            fuel: req.body.spec_fuel
        };

        // Generate a clean URL slug
        const slug = `${year}-${make}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Save to database via model
        await vehicleModel.createVehicle({
            make, model, year, price, mileage, 
            description, category_id, specs, slug
        });

        req.flash('success', `${year} ${make} ${model} added successfully.`);
        res.redirect('/vehicle');
    } catch (error) {
        console.error("Error adding vehicle:", error);
        next(error);
    }
};


// Handle deletion
const processDeleteVehicle = async (req, res, next) => {
    try {
        await vehicleModel.deleteVehicle(req.params.id);
        req.flash('success', 'Vehicle removed.');
        res.redirect('/vehicle');
    } catch (error) {
        next(error);
    }
};

export {
    showAddVehicleForm,
    processAddVehicle,
    processDeleteVehicle
}