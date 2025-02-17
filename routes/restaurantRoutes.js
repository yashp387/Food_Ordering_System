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


// Add menu items for a restaurant  (only restaurant owner)
router.post("/:id/menu", authMiddleware, async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const data = req.body;
        
        // Validate if provided ID is valid as mongoose objectId
        if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid restaurant ID"});
        }
        
        // Check is restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        
        if(!restaurant) return res.status(404).json({msg: "Restaurant not found"});
        
        // Ensure only restaurant owner can add menu items
        if(restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized, Only restaurant owner can add menu items"});
        }
        
        // Create new menu item
        const newMenuItem = new MenuItem(data);

        // save to database
        await newMenuItem.save();
        
        res.status(200).json({msg: "Menu item added successfully", menuItem: newMenuItem});

    } catch (error) {
        console.log("Error adding menu items in restaurants",error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get restaurant menu
router.get("/:id/menu", async (req, res) => {
    try {
        const restaurantId = req.params.id;
        console.log("Restaurant ID is ", restaurantId);

        // Validate if the provided ID is a valis mongoDB objectId
        if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid resturant ID"});
        }
        
        // Check if restaurant exist or not
        const restaurant = await Restaurant.findById(restaurantId);
        if(!restaurant) return res.status(404).json({msg: "No resturant found"});

        // Fetch menu items for this restaurant
        const menuItems = await MenuItem.find({ restaurantId }).lean();

       if(menuItems.length === 0) {
        return res.status(404).json({msg: "No menu items found for this resturant"});
       }

       res.status(200).json({menu: menuItems});

    } catch (error) {
        console.log("Error fetching restaurant menu", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

module.exports = router;