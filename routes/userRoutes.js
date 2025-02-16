const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { authMiddleware, generateToken} = require("./../middlewares/authMiddleware");


// User registration route
router.post("/register", async (req, res) => {
    try {
        // Assuming the request body contains the user data
        const {name, email, password, role} = req.body;

        const user = new User ({name , email, password, role});

        // save the new user to the database
        const newUser = await user.save();
        console.log("New user added to database");

        // Generate the token
        const payLoad = {
            id : user.id,
            role: user.role,
        }

        const token = generateToken(payLoad);

        res.status(200).json({response: newUser, token: token});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// User login route
router.post("/login", authMiddleware, async (req, res) => {
    try {
        // Extract the credential from the request body
        const { name, email, password, role} = req.body;

        if(!name || !email || !password || !role) {
            return res,status(404).json({error: "Invalid credentials"});
        }

        //Find the User by email address
        const user = await User.findOne({email: email});
        if(!user) return res.status(404).json({msg: "User not found"});

        // Generate token
        const payLoad = {
            id: user.id,
            role: user.role,
        }
        const token = generateToken(payLoad);

        // return toke as reponse
        res.status(200).json({token});

    } catch (error) {
        console.log("Error login user", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

// Get user profile
router.get("/profile", async (req, res) => {
    try {
        const users = await User.find();
        console.log("Fetched all users profiles");
        res.json(users);
    } catch (error) {
        console.log("Error fetching user profile", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update the user profile
router.put("/:id/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id   // Extract the userId from request parameter
        const userUpdatedData = req.body;  // Updated data for user

        // Ensure the authenticated user can update their profile (or admin)
        if(req.user.id !== userId && req.user.role !== "admin") {
            return res.status(400).json({msg: "Unauthorized, You can only update your own profile"});
        }

        // Update user profile
        const user = await User.findByIdAndUpdate(userId, userUpdatedData, {
            new: true,  // return updated data
            runValidators: true,  // run mongoose validation
        });

        if(!user) return res.status(404).json({msg: "User not found"});

        res.status(200).json({msg: "User data updates successfully"});

    } catch (error) {
        console.log("Error updating data", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Delete user profile
router.delete("/:id/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id

        // Ensure the only authenticated user can delete their profile (or admin)
        if(req.user.id !== userId && req.user.role !== "admin") {
            return res.status(403).json({msg: "Unauthorized, You can not delete this profile"});
        }

        // Delete user profile
        const user = await User.findByIdAndDelete(userId);

        if(!user) return res.status(404).json({msg: "User not found"});

        res.status(200).json({msg: "User profile deleted successfully"});

    } catch (error) {
        console.log("Error deleting user profile", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

module.exports = router;