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
})

module.exports = router;