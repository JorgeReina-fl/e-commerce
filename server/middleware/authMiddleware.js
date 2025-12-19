const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret with fallback (must match auth.js)
const getJwtSecret = () => process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token (using same secret as generation)
            const decoded = jwt.verify(token, getJwtSecret());

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // SECURITY: Minimal logging (no sensitive data)
            // console.log(`[AUTH] ${req.user.email} authenticated`);
            return next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('No token provided in request');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { protect, admin };
