// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token') || req.cookies.token;
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Aapke paas is action ki permission nahi hai" });
        }
        next();
    };
};

module.exports = { auth, checkRole };