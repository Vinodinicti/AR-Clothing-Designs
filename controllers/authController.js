const { dbAsync } = require('../config/db');

// @desc    Admin / User Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        const user = await dbAsync.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials. Please check your email and password.'
            });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Update last login timestamp
        await dbAsync.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Simple token for demonstration/session
        const token = `ar_token_${user.id}_${Date.now()}`;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Public
const getMe = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        const token = authHeader.split(' ')[1];
        const parts = token.split('_');
        const userId = parts[2];

        const user = await dbAsync.get('SELECT id, name, email, phone, role, status, last_login, created_at FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    login,
    getMe
};
