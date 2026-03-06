import db from '../../models/db.js';
import { updateRequestStatus } from '../../models/service/service.js';

 //Display all service requests for staff.
const manageServiceRequests = async (req, res, next) => {
    try {
        const sql = `
            SELECT s.*, u.name as customer_name, u.email as customer_email
            FROM service_requests s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC`;
        const result = await db.query(sql);
        
        res.render('admin/services', { 
            title: 'Service Management', 
            requests: result.rows 
        });
    } catch (error) {
        next(error);
    }
};

const processStatusUpdate = async (req, res, next) => {
    try {
        const { id, status, notes } = req.body;
        await updateRequestStatus(id, status, notes);
        
        req.flash('success', `Request #${id} updated successfully.`);
        res.redirect('/admin/services');
    } catch (error) {
        next(error);
    }
};

export {
    manageServiceRequests,
    processStatusUpdate
}
