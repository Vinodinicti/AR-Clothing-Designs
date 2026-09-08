const { dbAsync } = require('../config/db');

// Helper to generate unique enquiry code
const generateEnquiryCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `ENQ-2026-${randomDigits}`;
};

// @desc    Get All Project Enquiries (with search filter)
// @route   GET /api/enquiries
// @access  Public
const getEnquiries = async (req, res, next) => {
    try {
        const { search, status } = req.query;
        let query = 'SELECT * FROM enquiries WHERE 1=1';
        const params = [];

        if (search && search.trim() !== '') {
            query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(company) LIKE LOWER(?) OR LOWER(enquiry_code) LIKE LOWER(?) OR LOWER(service) LIKE LOWER(?))';
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term, term);
        }

        if (status && status.trim() !== '' && status.toLowerCase() !== 'all') {
            query += ' AND LOWER(status) = LOWER(?)';
            params.push(status.trim());
        }

        query += ' ORDER BY created_at DESC';

        const rows = await dbAsync.all(query, params);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Single Project Enquiry by ID
// @route   GET /api/enquiries/:id
// @access  Public
const getEnquiryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const row = await dbAsync.get('SELECT * FROM enquiries WHERE id = ? OR enquiry_code = ?', [id, id]);

        if (!row) {
            return res.status(404).json({
                success: false,
                error: `Project enquiry not found with ID ${id}`
            });
        }

        res.status(200).json({
            success: true,
            data: row
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create New Project Enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res, next) => {
    try {
        const { name, company, email, phone, service, quantity, timeline, budget, message } = req.body;

        if (!name || !email || !phone || !service || !quantity || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please fill out all required fields: Name, Email, Phone, Service, Quantity, and Message'
            });
        }

        const enquiryCode = generateEnquiryCode();

        const insertSql = `
            INSERT INTO enquiries (
                enquiry_code, name, company, email, phone, service, quantity, timeline, budget, message, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            enquiryCode,
            name.trim(),
            company ? company.trim() : 'Independent',
            email.trim(),
            phone.trim(),
            service.trim(),
            quantity.trim(),
            timeline ? timeline.trim() : 'Flexible / Planning Phase',
            budget ? budget.trim() : 'Under ₹25,000',
            message.trim(),
            'Pending Review'
        ];

        const result = await dbAsync.run(insertSql, params);
        const newEnquiry = await dbAsync.get('SELECT * FROM enquiries WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: 'Project enquiry submitted successfully!',
            data: newEnquiry
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Project Enquiry Status
// @route   PUT /api/enquiries/:id
// @access  Public
const updateEnquiry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const existing = await dbAsync.get('SELECT * FROM enquiries WHERE id = ? OR enquiry_code = ?', [id, id]);

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: `Project enquiry not found with ID ${id}`
            });
        }

        const updateSql = 'UPDATE enquiries SET status = ? WHERE id = ?';
        await dbAsync.run(updateSql, [status || existing.status, existing.id]);

        const updated = await dbAsync.get('SELECT * FROM enquiries WHERE id = ?', [existing.id]);

        res.status(200).json({
            success: true,
            message: 'Project enquiry updated successfully',
            data: updated
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Project Enquiry
// @route   DELETE /api/enquiries/:id
// @access  Public
const deleteEnquiry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await dbAsync.get('SELECT * FROM enquiries WHERE id = ? OR enquiry_code = ?', [id, id]);

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: `Project enquiry not found with ID ${id}`
            });
        }

        await dbAsync.run('DELETE FROM enquiries WHERE id = ?', [existing.id]);

        res.status(200).json({
            success: true,
            message: 'Project enquiry deleted successfully',
            data: existing
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getEnquiries,
    getEnquiryById,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry
};
