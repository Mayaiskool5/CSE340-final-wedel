// Show the form to edit a vehicle
const showEditVehicleForm = async (req, res, next) => {
    try {
        const vehicle = await getVehicleById(req.params.id);
        if (!vehicle) {
            req.flash('error', 'Vehicle not found.');
            return res.redirect('/vehicle');
        }
        const categories = await db.query('SELECT * FROM categories');
        res.render('admin/edit-vehicle', {
            title: `Edit Vehicle - ${vehicle.make} ${vehicle.model}`,
            vehicle,
            categories: categories.rows
        });
    } catch (error) {
        next(error);
    }
};

// Process vehicle edit
const processEditVehicle = async (req, res, next) => {
    try {
        const { make, model, year, price, mileage, description, category_id, availability_status } = req.body;
        const specs = {
            engine: req.body.spec_engine,
            transmission: req.body.spec_trans,
            fuel: req.body.spec_fuel
        };
        await updateVehicle(req.params.id, {
            make, model, year, price, mileage, description, category_id, specs,
            availability_status: availability_status === 'true'
        });
        await logActivity(req, 'EDIT_VEHICLE', `Vehicle ${req.params.id} updated.`);
        req.flash('success', 'Vehicle updated successfully.');
        res.redirect('/vehicle');
    } catch (error) {
        console.error('Error updating vehicle:', error);
        next(error);
    }
};
import {
    getVehicleById,
    getVehicleBySlug,
    getVehiclesByCategory,
    getSortedVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    searchVehicles,
    getFeaturedVehicles,
    getInventoryStats,
    getAllVehiclesWithCategory
} from '../../models/vehicles/vehicle.js';
import * as getAllCatagories from '../../models/vehicles/category.js';
import db from '../../models/db.js';
import { logActivity } from '../../utils/logger.js';

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
        await createVehicle({
            make, model, year, price, mileage, 
            description, category_id, specs, slug
        });
        
        await logActivity(
            req, 'ADD_VEHICLE', `Owner added ${req.body.year} ${req.body.make}`);

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
        await deleteVehicle(req.params.id);
        req.flash('success', 'Vehicle removed.');
        res.redirect('/vehicle');
    } catch (error) {
        next(error);
    }
};

const showActivityLogs = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT a.*, u.name as user_name 
            FROM activity_logs a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC LIMIT 100
        `);
        res.render('admin/activity-logs', { title: 'System Activity', logs: result.rows });
    } catch (error) { next(error); }
};

// Show categories management view
const showManageCategories = async (req, res, next) => {
    try {
        const categories = await getAllCatagories.getAllCategories();
        res.render('admin/categories', { title: 'Manage Categories', categories });
    } catch (error) { next(error); }
};

// Process adding a new category
const processAddCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        await getAllCatagories.createCategory(name);
        req.flash('success', `Category "${name}" added.`);
        res.redirect('/admin/categories');
    } catch (error) { next(error); }
};

// Show the list of vehicles for editing
const showListVehicles = async (req, res, next) => {
    try {
        const vehicles = await getAllVehiclesWithCategory();
        res.render('admin/list-vehicles', { title: 'Edit Vehicles', vehicles });
    } catch (error) {
        next(error);
    }
};

export {
    showAddVehicleForm,
    processAddVehicle,
    processDeleteVehicle,
    showEditVehicleForm,
    processEditVehicle,
    showActivityLogs,
    showManageCategories,
    processAddCategory,
    showListVehicles,
};