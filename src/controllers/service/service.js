import * as serviceModel from '../../models/service/service.js';

// Show the form to the customer
const showServiceForm = (req, res) => {
    res.render('services/request-form', { title: 'Schedule Service' });
};

// Handle the POST request from the form
const submitServiceRequest = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        // Basic validation could be added here
        await serviceModel.createServiceRequest(userId, req.body);

        // Use the model we wrote earlier to save to DB
        await serviceModel.createServiceRequest(userId, {
            vehicle_info,
            service_type,
            inventory_vehicle_id
        });
        
        req.flash('success', 'Your service request has been submitted!');
        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
};

// Employee view: see all requests
const manageAllRequests = async (req, res, next) => {
    try {
        // Fetch all requests and join with users to see WHO requested it
        const query = `
            SELECT s.*, u.name as customer_name, u.email as customer_email
            FROM service_requests s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `;
        const result = await db.query(query);

        res.render('admin/manage-services', { 
            title: 'Service Management Queue', 
            requests: result.rows 
        });
    } catch (error) {
        console.error("Error fetching all service requests:", error);
        next(error);
    }
};

/**
 * Process the status update from the form
 */
const updateServiceStatus = async (req, res, next) => {
    try {
        const { requestId, status, notes } = req.body;
        
        const query = `
            UPDATE service_requests 
            SET status = $1, employee_notes = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `;
        await db.query(query, [status, notes, requestId]);

        req.flash('success', `Request #${requestId} updated to ${status}`);
        res.redirect('/services/manage');
    } catch (error) {
        next(error);
    }
};

export { showServiceForm, 
        submitServiceRequest, 
        manageAllRequests,
        updateServiceStatus
    };
