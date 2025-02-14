const jwt = require("jsonwebtoken");
const express = require("express");

const authMiddleware = (req, res,next) => {
    const authorization = req.headers.authorization;
    if(!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(404).json({msg: "Token not found"});
    }

    const token = authorization.split(" ")[1];
    if(!token) return res.status(404).json({error: "Unauthorized"});

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user information with request object
        req.user = decoded
        next();

    } catch (error) {
        console.log("Error verifying token", error);
        res.status(500).json({msg: "Internal server error"});
    }
}


// Function to generate token
const generateToken = (userData) => {
    // Generate the jwt token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: "24h"});
}

module.exports = { authMiddleware, generateToken };