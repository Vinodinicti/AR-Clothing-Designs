const express = require('express');
const router = express.Router();
const { dbAsync } = require('../config/db');

// GET /api/likes - Get all liked products
router.get('/', async (req, res) => {
    try {
        const rows = await dbAsync.all("SELECT * FROM liked_items ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/likes - Add product to liked summary
router.post('/', async (req, res) => {
    try {
        const { user_email, user_name, product_name, product_id, category, price } = req.body;
        if (!user_email || !product_name) {
            return res.status(400).json({ success: false, error: 'User email and product name required' });
        }

        const sql = `INSERT INTO liked_items (user_email, user_name, product_name, product_id, category, price) VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await dbAsync.run(sql, [
            user_email,
            user_name || 'Customer',
            product_name,
            product_id || null,
            category || 'Clothing',
            price || 0.0
        ]);

        const newRecord = await dbAsync.get("SELECT * FROM liked_items WHERE id = ?", [result.id]);
        res.status(201).json({ success: true, data: newRecord });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/likes/:id - Remove item from likes
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dbAsync.run("DELETE FROM liked_items WHERE id = ?", [id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Liked item not found' });
        }
        res.status(200).json({ success: true, message: `Liked item #${id} deleted` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
