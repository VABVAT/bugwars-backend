const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

module.exports = authMiddleware;