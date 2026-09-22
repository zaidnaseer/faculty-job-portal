const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isEmailVerificationRequired } = require('../config/featureFlags');

// ✅ Middleware for basic authentication
const requireAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Token verification failed:', error);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please log in again.' });
      }

      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
// ✅ Middleware for role-based access
const protect = (roles = []) => async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'NoUser' });
    }

    // Verification is mandatory for HR accounts on every protected route.
    // Faculty can use the site unverified; specific routes (e.g. applying to
    // a job) opt in to verification via requireVerifiedEmail below.
    if (isEmailVerificationRequired() && req.user.role === 'hr' && !req.user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address to continue.', code: 'EMAIL_NOT_VERIFIED' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next(); // ✅ Proceed if role is valid
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ Middleware to gate a specific action (e.g. applying to a job) behind
// email verification, for roles where verification isn't otherwise mandatory.
// Must run after `protect`, since it relies on req.user.
const requireVerifiedEmail = (req, res, next) => {
  if (isEmailVerificationRequired() && !req.user?.isEmailVerified) {
    return res.status(403).json({
      message: 'Please verify your email address before applying to jobs.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
};

module.exports = { requireAuth, protect, requireVerifiedEmail };
