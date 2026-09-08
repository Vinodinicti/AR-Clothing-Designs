const express = require('express');
const router = express.Router();
const {
    getOrderStats,
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

// Order statistics endpoint
router.get('/stats', getOrderStats);

// Order CRUD endpoints
router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrderById)
    .put(updateOrder)
    .delete(deleteOrder);

module.exports = router;
