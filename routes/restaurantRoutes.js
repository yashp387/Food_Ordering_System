const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Restaurant = require("./../models/restaurant");
const MenuItem = require("./../models/menuItem");
const { authMiddleware, generateToken} = require("./../middlewares/authMiddleware");


// POST request to add restaurant (Admin only)
router.post("/", authMiddleware, async (req, res) => {
    try {
        // Ensure only admin can add a restaurant
        if (req.user.role !== "admin") {
            res.status(400).json({msg: "Unauthorized, Only admin can add restaurant"});
        }

        const data = req.body;

        if(!data) return res.status(404).json({msg: "No data found"});

        // Create new restaurant
        const newRestaurant = new Restaurant(data);

        // Save the restaurant to databse   
        await newRestaurant.save(); 

        res.status(200).json({msg: "New restaurant added successfully", newRestaurant: newRestaurant});

    } catch (error) {
        console.log("Error adding restaurant",error);
        res.status(500).json({msg: "Interna server error"});
    }
});


// List all restaurants
router.get("/", async (req, res) => {
    try {
        const restaurant = await Restaurant.find();
        if(!restaurant) return res.status(404).json({msg: "No restaurant found"});
        res.status(200).json(restaurant);

    } catch (error) {
        console.log("Error fetching restaurant", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Search Restaurants
router.get("/search", async (req, res) => {
    try {
        const {name, address, cuisine} = req.query;

        // Build a dynamic query object
        const query = {};

        if(name) {
            query.name = {$regex: name, $options: "i"}    // Case insensitive search
        }

        if(address) {
            query.address = {$regex: address, $options: "i"}
        }

        if(cuisine) {
            query.cuisine = {$regex: cuisine, $options: "i"}
        }

        // Fetching restaurant
        const restaurant = await Restaurant.find(query);

        if(!restaurant) return res.status(404).json({msg: "No restaurant found"});

        res.status(200).json(restaurant);

    } catch (error) {
        console.log("Error searching restaurants", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get restaurant details
router.get("/:id", async(req, res) => {
    try {
        // Extract the restaurant id from the request parameter
        const restaurantId = req.params.id

        // Validate if provided ID is a valid mongoDB objectId
        if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid restaurant ID"});
        }
        
        // Find Restaurant
        const restaurant = await Restaurant.findById(restaurantId);
        
        if(!restaurant) {
            return res.status(404).json({msg: "No restaurant found"});
        }
        res.status(200).json(restaurant);

    } catch (error) {
        console.log("Error fetching restaurant details", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update restaurant (Admin only)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const updates = req.body;

         // Validate the provided ID is a valid mongoose objectId
         if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid restaurant ID"});
        }

        // Ensure user is authenticated and is an admin
        if(!req.user || req.user.role !== "admin") {
            return res.status(403).json({msg: "Unauthorized, Only admins can update restaurants"});
        }

        // Check if updates object is empty
        if(Object.keys(updates).length === 0) {
            return res.status(400).json({msg: "No updated field provided"});
        }

        // Find the restaurant
        const restaurant = await Restaurant.findById(restaurantId);
        if(!restaurant) {
            return res.status(404).json({msg: "No restaurant found"});
        }

        // Update the restaurant
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({msg: "Restaurant updated successfully", updatedRestaurant: updatedRestaurant});

    } catch (error) {
        console.log("Error updating restaurant", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Delete Restaurant (only restaurant owner)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const restaurantId = req.params.id;
        
        // Validate the provided ID is a valid mongoose objectId
        if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid restaurant ID"});
        }

        // Ensure user is authenticated and is an admin
        if(!req.user || req.user.role !== "admin") {
            return res.status(403).json({msg: "Unauthorized, You can not delete this restaurant"});
        }

        // Find the restaurant
        const restaurant = await Restaurant.findById(restaurantId);

        if(!restaurant) {
            return res.status(404).json({msg: "No restaurant found"});
        }

        // Delete a restaurant
        await Restaurant.findByIdAndDelete(restaurantId);
        // await restaurant.deleteOne();

        res.status(200).json({msg: "Restaurant deleted successfully"});

    } catch (error) {
        console.log("Error deleting restaurant", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

module.exports = router;