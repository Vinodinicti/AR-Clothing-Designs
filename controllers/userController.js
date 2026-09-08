const { dbAsync } = require('../config/db');

// @desc    Get Users Summary Metrics
// @route   GET /api/users/stats
// @access  Public
const getUserStats = async (req, res, next) => {
    try {
        const totalUsersRow = await dbAsync.get('SELECT COUNT(*) as count FROM users');
        const activeUsersRow = await dbAsync.get("SELECT COUNT(*) as count FROM users WHERE LOWER(status) = 'active'");
        const customersRow = await dbAsync.get("SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'customer'");

        res.status(200).json({
            success: true,
            data: {
                totalUsers: totalUsersRow ? totalUsersRow.count : 0,
                activeUsers: activeUsersRow ? activeUsersRow.count : 0,
                totalCustomers: customersRow ? customersRow.count : 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get All Users Summary List
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
    try {
        const { search, role, status } = req.query;

        let query = 'SELECT id, name, email, phone, role, status, last_login, created_at FROM users WHERE 1=1';
        const params = [];

        if (search && search.trim() !== '') {
            query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(phone) LIKE LOWER(?))';
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        if (role && role.trim() !== '' && role.toLowerCase() !== 'all') {
            query += ' AND LOWER(role) = LOWER(?)';
            params.push(role.trim());
        }

        if (status && status.trim() !== '' && status.toLowerCase() !== 'all') {
            query += ' AND LOWER(status) = LOWER(?)';
            params.push(status.trim());
        }

        query += ' ORDER BY id DESC';

        const users = await dbAsync.all(query, params);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create New User / Customer
// @route   POST /api/users
// @access  Public
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, status } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email, and password'
            });
        }

        const existing = await dbAsync.get('SELECT id, name, email, phone, role, status, last_login, created_at FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
        if (existing) {
            await dbAsync.run('UPDATE users SET name = ?, phone = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?', [
                name || existing.name,
                phone || existing.phone,
                existing.id
            ]);
            const updatedUser = await dbAsync.get('SELECT id, name, email, phone, role, status, last_login, created_at FROM users WHERE id = ?', [existing.id]);
            return res.status(200).json({
                success: true,
                message: 'Customer profile updated successfully',
                data: updatedUser
            });
        }

        const sql = `
            INSERT INTO users (name, email, password, phone, role, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            name,
            email.trim(),
            password,
            phone || '',
            role || 'customer',
            status || 'Active'
        ];

        const result = await dbAsync.run(sql, params);
        const newUser = await dbAsync.get('SELECT id, name, email, phone, role, status, last_login, created_at FROM users WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update User Status / Role
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingUser = await dbAsync.get('SELECT * FROM users WHERE id = ?', [id]);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: `User not found with id ${id}`
            });
        }

        const { name, email, phone, role, status } = req.body;

        const updatedName = name !== undefined ? name : existingUser.name;
        const updatedEmail = email !== undefined ? email : existingUser.email;
        const updatedPhone = phone !== undefined ? phone : existingUser.phone;
        const updatedRole = role !== undefined ? role : existingUser.role;
        const updatedStatus = status !== undefined ? status : existingUser.status;

        const sql = `
            UPDATE users
            SET name = ?, email = ?, phone = ?, role = ?, status = ?
            WHERE id = ?
        `;

        await dbAsync.run(sql, [updatedName, updatedEmail, updatedPhone, updatedRole, updatedStatus, id]);
        const updatedUser = await dbAsync.get('SELECT id, name, email, phone, role, status, last_login, created_at FROM users WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingUser = await dbAsync.get('SELECT * FROM users WHERE id = ?', [id]);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: `User not found with id ${id}`
            });
        }

        await dbAsync.run('DELETE FROM users WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: `User #${id} deleted successfully`,
            data: { id: parseInt(id, 10) }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUserStats,
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
