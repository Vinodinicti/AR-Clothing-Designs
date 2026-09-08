const { dbAsync } = require('../config/db');

// @desc    Get Inventory Dashboard Statistics
// @route   GET /api/items/stats
// @access  Public
const getItemStats = async (req, res, next) => {
    try {
        const totalItemsRow = await dbAsync.get('SELECT COUNT(*) as count FROM items');
        const activeItemsRow = await dbAsync.get("SELECT COUNT(*) as count FROM items WHERE LOWER(status) = 'in stock' OR LOWER(status) = 'active'");
        const totalValueRow = await dbAsync.get('SELECT SUM(price) as totalValue FROM items');

        const totalItems = totalItemsRow ? totalItemsRow.count : 0;
        const activeItems = activeItemsRow ? activeItemsRow.count : 0;
        const totalInventoryValue = totalValueRow && totalValueRow.totalValue ? parseFloat(totalValueRow.totalValue.toFixed(2)) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalItems,
                activeItems,
                totalInventoryValue
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get All Items with Search, Filter & Sort
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
    try {
        const { search, category, status, sort } = req.query;

        let query = 'SELECT * FROM items WHERE 1=1';
        const params = [];

        // Search in title or description
        if (search && search.trim() !== '') {
            query += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm);
        }

        // Filter by Category
        if (category && category.trim() !== '' && category.toLowerCase() !== 'all categories' && category.toLowerCase() !== 'all') {
            query += ' AND LOWER(category) = LOWER(?)';
            params.push(category.trim());
        }

        // Filter by Status
        if (status && status.trim() !== '' && status.toLowerCase() !== 'all statuses' && status.toLowerCase() !== 'all') {
            query += ' AND LOWER(status) = LOWER(?)';
            params.push(status.trim());
        }

        // Sorting
        switch (sort) {
            case 'id_asc':
                query += ' ORDER BY id ASC';
                break;
            case 'price_asc':
                query += ' ORDER BY price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY price DESC';
                break;
            case 'title_asc':
                query += ' ORDER BY title ASC';
                break;
            case 'title_desc':
                query += ' ORDER BY title DESC';
                break;
            case 'id_desc':
            default:
                query += ' ORDER BY id DESC';
                break;
        }

        const items = await dbAsync.all(query, params);

        const formattedItems = items.map(item => ({
            ...item,
            sizes: item.sizes ? item.sizes.split(',').map(s => s.trim()) : []
        }));

        res.status(200).json({
            success: true,
            count: formattedItems.length,
            data: formattedItems
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Single Item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await dbAsync.get('SELECT * FROM items WHERE id = ?', [id]);

        if (!item) {
            return res.status(404).json({
                success: false,
                error: `Item not found with id ${id}`
            });
        }

        item.sizes = item.sizes ? item.sizes.split(',').map(s => s.trim()) : [];

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create New Item (with image file upload support)
// @route   POST /api/items
// @access  Public
const createItem = async (req, res, next) => {
    try {
        const { title, category, price, status, description, image, original_price, tag, sizes } = req.body;

        if (!title || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide title, category, and price'
            });
        }

        // Determine image path (from uploaded file or form body text)
        let imagePath = image || '';
        if (req.file) {
            imagePath = `images/uploads/${req.file.filename}`;
        }

        const formattedSizes = Array.isArray(sizes) ? sizes.join(',') : (sizes || '');
        const itemStatus = status || 'In Stock';

        const sql = `
            INSERT INTO items (title, category, price, status, description, image, original_price, tag, sizes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            title,
            category,
            parseFloat(price),
            itemStatus,
            description || '',
            imagePath,
            original_price ? parseFloat(original_price) : null,
            tag || '',
            formattedSizes
        ];

        const result = await dbAsync.run(sql, params);
        const newItem = await dbAsync.get('SELECT * FROM items WHERE id = ?', [result.id]);
        newItem.sizes = newItem.sizes ? newItem.sizes.split(',').map(s => s.trim()) : [];

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: newItem
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Existing Item (with image file upload support)
// @route   PUT /api/items/:id
// @access  Public
const updateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingItem = await dbAsync.get('SELECT * FROM items WHERE id = ?', [id]);

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                error: `Item not found with id ${id}`
            });
        }

        const { title, category, price, status, description, image, original_price, tag, sizes } = req.body;

        let updatedImage = existingItem.image;
        if (req.file) {
            updatedImage = `images/uploads/${req.file.filename}`;
        } else if (image !== undefined && image !== '') {
            updatedImage = image;
        }

        const updatedTitle = title !== undefined ? title : existingItem.title;
        const updatedCategory = category !== undefined ? category : existingItem.category;
        const updatedPrice = price !== undefined ? parseFloat(price) : existingItem.price;
        const updatedStatus = status !== undefined ? status : existingItem.status;
        const updatedDescription = description !== undefined ? description : existingItem.description;
        const updatedOriginalPrice = original_price !== undefined ? parseFloat(original_price) : existingItem.original_price;
        const updatedTag = tag !== undefined ? tag : existingItem.tag;
        const updatedSizes = sizes !== undefined ? (Array.isArray(sizes) ? sizes.join(',') : sizes) : existingItem.sizes;

        const sql = `
            UPDATE items
            SET title = ?, category = ?, price = ?, status = ?, description = ?, image = ?, original_price = ?, tag = ?, sizes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const params = [
            updatedTitle,
            updatedCategory,
            updatedPrice,
            updatedStatus,
            updatedDescription,
            updatedImage,
            updatedOriginalPrice,
            updatedTag,
            updatedSizes,
            id
        ];

        await dbAsync.run(sql, params);
        const updatedItem = await dbAsync.get('SELECT * FROM items WHERE id = ?', [id]);
        updatedItem.sizes = updatedItem.sizes ? updatedItem.sizes.split(',').map(s => s.trim()) : [];

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: updatedItem
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Item
// @route   DELETE /api/items/:id
// @access  Public
const deleteItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingItem = await dbAsync.get('SELECT * FROM items WHERE id = ?', [id]);

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                error: `Item not found with id ${id}`
            });
        }

        await dbAsync.run('DELETE FROM items WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: `Item #${id} deleted successfully`,
            data: { id: parseInt(id, 10) }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getItemStats,
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
};
