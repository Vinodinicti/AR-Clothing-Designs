const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
    getItemStats,
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');

// Stats endpoint
router.get('/stats', getItemStats);

// Items CRUD endpoints with image file upload support
router.route('/')
    .get(getItems)
    .post(upload.single('image'), createItem);

router.route('/:id')
    .get(getItemById)
    .put(upload.single('image'), updateItem)
    .delete(deleteItem);

module.exports = router;
