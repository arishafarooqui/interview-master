const jwt = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist.model")

const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized - Please login first"
        })
    }

    // Check karo token blacklist mein toh nahi
    const isBlacklisted = await blacklistModel.findOne({ token })
    if (isBlacklisted) {
        return res.status(401).json({
            message: "Session expired - Please login again"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

module.exports = { isAuthenticated }