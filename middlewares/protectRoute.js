const jwt = require("jsonwebtoken")
require("dotenv").config() 
const User = require("../models/userModel")

exports.protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        const user = await User.findOne({ _id: decoded.id }).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        next()
        
    } catch (err) {
        console.error(err); // Log the error
        return res.status(500).json({
            success: false,
            message: "An error occurred"
        });
    }
};
