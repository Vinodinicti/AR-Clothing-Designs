const { dbAsync } = require('../config/db');

// Helper to generate unique order numbers
const generateOrderNumber = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `ORD-2026-${randomDigits}`;
};

// @desc    Get Clothing Product Orders Statistics
// @route   GET /api/orders/stats
// @access  Public
const getOrderStats = async (req, res, next) => {
    try {
        const totalOrdersRow = await dbAsync.get('SELECT COUNT(*) as count FROM orders');
        const totalRevenueRow = await dbAsync.get("SELECT SUM(total_amount) as total FROM orders WHERE LOWER(payment_status) = 'paid'");
        const processingRow = await dbAsync.get("SELECT COUNT(*) as count FROM orders WHERE LOWER(order_status) = 'processing'");
        const shippedRow = await dbAsync.get("SELECT COUNT(*) as count FROM orders WHERE LOWER(order_status) = 'shipped'");
        const deliveredRow = await dbAsync.get("SELECT COUNT(*) as count FROM orders WHERE LOWER(order_status) = 'delivered'");
        const pendingPaymentRow = await dbAsync.get("SELECT COUNT(*) as count FROM orders WHERE LOWER(payment_status) = 'pending'");

        res.status(200).json({
            success: true,
            data: {
                totalOrders: totalOrdersRow ? totalOrdersRow.count : 0,
                totalRevenue: totalRevenueRow && totalRevenueRow.total ? parseFloat(totalRevenueRow.total.toFixed(2)) : 0,
                processingOrders: processingRow ? processingRow.count : 0,
                shippedOrders: shippedRow ? shippedRow.count : 0,
                deliveredOrders: deliveredRow ? deliveredRow.count : 0,
                pendingPaymentOrders: pendingPaymentRow ? pendingPaymentRow.count : 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get All Clothing Orders (with search and status filter)
// @route   GET /api/orders
// @access  Public
const getOrders = async (req, res, next) => {
    try {
        const { search, order_status, payment_status, sort } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        // Search by order_number, customer_name, customer_email, or product_name
        if (search && search.trim() !== '') {
            query += ' AND (LOWER(order_number) LIKE LOWER(?) OR LOWER(customer_name) LIKE LOWER(?) OR LOWER(customer_email) LIKE LOWER(?) OR LOWER(product_name) LIKE LOWER(?))';
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term);
        }

        // Filter by Order Status
        if (order_status && order_status.trim() !== '' && order_status.toLowerCase() !== 'all') {
            query += ' AND LOWER(order_status) = LOWER(?)';
            params.push(order_status.trim());
        }

        // Filter by Payment Status
        if (payment_status && payment_status.trim() !== '' && payment_status.toLowerCase() !== 'all') {
            query += ' AND LOWER(payment_status) = LOWER(?)';
            params.push(payment_status.trim());
        }

        // Sorting
        switch (sort) {
            case 'amount_desc':
                query += ' ORDER BY total_amount DESC';
                break;
            case 'amount_asc':
                query += ' ORDER BY total_amount ASC';
                break;
            case 'id_asc':
                query += ' ORDER BY id ASC';
                break;
            case 'id_desc':
            default:
                query += ' ORDER BY id DESC';
                break;
        }

        const orders = await dbAsync.all(query, params);

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Single Order by ID or Order Number
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let order;

        if (isNaN(id)) {
            // Search by order number string
            order = await dbAsync.get('SELECT * FROM orders WHERE LOWER(order_number) = LOWER(?)', [id]);
        } else {
            // Search by ID integer
            order = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [id]);
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                error: `Order not found with identifier '${id}'`
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create New Clothing Product Order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res, next) => {
    try {
        const {
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            product_id,
            product_name,
            size,
            quantity,
            unit_price,
            payment_status,
            order_status,
            courier_name,
            tracking_awb
        } = req.body;

        if (!customer_name || !customer_email || !shipping_address || !product_name || unit_price === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide customer_name, customer_email, shipping_address, product_name, and unit_price'
            });
        }

        const orderNum = generateOrderNumber();
        const qty = quantity ? parseInt(quantity, 10) : 1;
        const price = parseFloat(unit_price);
        const total = price * qty;
        const payStatus = payment_status || 'Paid';
        const ordStatus = order_status || 'Processing';
        const courierName = courier_name || 'BlueDart Express';
        const awbNumber = tracking_awb || `AWB-${Math.floor(10000000 + Math.random() * 90000000)}`;

        const sql = `
            INSERT INTO orders (
                order_number, customer_name, customer_email, customer_phone,
                shipping_address, product_id, product_name, size, quantity,
                unit_price, total_amount, payment_status, order_status,
                courier_name, tracking_awb
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            orderNum,
            customer_name,
            customer_email,
            customer_phone || '',
            shipping_address,
            product_id || null,
            product_name,
            size || 'M',
            qty,
            price,
            total,
            payStatus,
            ordStatus,
            courierName,
            awbNumber
        ];

        const result = await dbAsync.run(sql, params);
        const newOrder = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: 'Clothing order placed successfully',
            data: newOrder
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Order Status or Info
// @route   PUT /api/orders/:id
// @access  Public
const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingOrder = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [id]);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                error: `Order not found with id ${id}`
            });
        }

        const {
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            size,
            quantity,
            unit_price,
            payment_status,
            order_status,
            courier_name,
            tracking_awb
        } = req.body;

        const updatedCustomerName = customer_name !== undefined ? customer_name : existingOrder.customer_name;
        const updatedCustomerEmail = customer_email !== undefined ? customer_email : existingOrder.customer_email;
        const updatedCustomerPhone = customer_phone !== undefined ? customer_phone : existingOrder.customer_phone;
        const updatedShippingAddress = shipping_address !== undefined ? shipping_address : existingOrder.shipping_address;
        const updatedSize = size !== undefined ? size : existingOrder.size;
        const updatedQuantity = quantity !== undefined ? parseInt(quantity, 10) : existingOrder.quantity;
        const updatedUnitPrice = unit_price !== undefined ? parseFloat(unit_price) : existingOrder.unit_price;
        const updatedTotalAmount = updatedUnitPrice * updatedQuantity;
        const updatedPaymentStatus = payment_status !== undefined ? payment_status : existingOrder.payment_status;
        const updatedOrderStatus = order_status !== undefined ? order_status : existingOrder.order_status;
        const updatedCourierName = courier_name !== undefined ? courier_name : (existingOrder.courier_name || 'BlueDart Express');
        const updatedTrackingAwb = tracking_awb !== undefined ? tracking_awb : (existingOrder.tracking_awb || 'AWB-98421074');

        const sql = `
            UPDATE orders
            SET customer_name = ?, customer_email = ?, customer_phone = ?, shipping_address = ?,
                size = ?, quantity = ?, unit_price = ?, total_amount = ?, payment_status = ?, order_status = ?,
                courier_name = ?, tracking_awb = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const params = [
            updatedCustomerName,
            updatedCustomerEmail,
            updatedCustomerPhone,
            updatedShippingAddress,
            updatedSize,
            updatedQuantity,
            updatedUnitPrice,
            updatedTotalAmount,
            updatedPaymentStatus,
            updatedOrderStatus,
            updatedCourierName,
            updatedTrackingAwb,
            id
        ];

        await dbAsync.run(sql, params);
        const updatedOrder = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete / Cancel Order
// @route   DELETE /api/orders/:id
// @access  Public
const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingOrder = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [id]);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                error: `Order not found with id ${id}`
            });
        }

        await dbAsync.run('DELETE FROM orders WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: `Order #${id} (${existingOrder.order_number}) deleted successfully`,
            data: { id: parseInt(id, 10), order_number: existingOrder.order_number }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getOrderStats,
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};
