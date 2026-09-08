// Centralized Error Handler Middleware

const errorHandler = (err, req, res, next) => {
    console.error('❌ Server Error:', err.stack || err.message);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Endpoint not found - ${req.originalUrl}`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
