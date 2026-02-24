const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // SIMPLE & SAFE admin check (Phase-1)
    if (user.email !== 'admin@greennets.com') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error (admin)' });
  }
};

module.exports = adminMiddleware;
