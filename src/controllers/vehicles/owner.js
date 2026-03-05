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
        // Generate a slug if one isn't provided (e.g., 2024-ford-f150)
        req.body.slug = `${req.body.year}-${req.body.make}-${req.body.model}`.toLowerCase().replace(/ /g, '-');
        
        await vehicleModel.createVehicle(req.body);
        req.flash('success', 'Vehicle added to inventory!');
        res.redirect('/vehicle'); // Redirect to the directory
    } catch (error) {
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