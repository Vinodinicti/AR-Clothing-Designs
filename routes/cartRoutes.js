const express = require('express');
const router = express.Router();
const { dbAsync } = require('../config/db');

// GET /api/cart - Get all cart items
router.get('/', async (req, res) => {
    try {
        const rows = await dbAsync.all("SELECT * FROM cart_items ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/cart - Add item to cart summary
router.post('/', async (req, res) => {
    try {
        const { user_email, user_name, product_name, product_id, size, quantity, unit_price, status } = req.body;
        if (!user_email || !product_name || !unit_price) {
            return res.status(400).json({ success: false, error: 'User email, product name, and price required' });
        }

        const sql = `INSERT INTO cart_items (user_email, user_name, product_name, product_id, size, quantity, unit_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await dbAsync.run(sql, [
            user_email,
            user_name || 'Customer',
            product_name,
            product_id || null,
            size || 'M',
            quantity || 1,
            unit_price,
            status || 'Active Cart'
        ]);

        const newRecord = await dbAsync.get("SELECT * FROM cart_items WHERE id = ?", [result.id]);
        res.status(201).json({ success: true, data: newRecord });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dbAsync.run("DELETE FROM cart_items WHERE id = ?", [id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }
        res.status(200).json({ success: true, message: `Cart item #${id} deleted` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
