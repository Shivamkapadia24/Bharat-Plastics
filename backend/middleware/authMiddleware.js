const jwt = require('jsonwebtoken');

// Middleware function to verify JWT
module.exports = function(req, res, next) {
    // 1. Get token from header
    const token = req.header('Authorization'); // Standard header for tokens

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        // Check if token starts with 'Bearer ' (common convention)
        let actualToken = token;
        if (token.startsWith('Bearer ')) {
            actualToken = token.split(' ')[1]; // Get the token part after 'Bearer '
        }

        // Verify the token using your secret
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

        // 4. Add user from payload to request object
        // The payload had { user: { id: userId } }
        req.user = decoded.user; 

        // 5. Call the next middleware or route handler
        next(); 

    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};