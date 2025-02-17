const express = require("express");
const router = express.Router();
const Restaurant = require("./../models/restaurant");
const MenuItem = require("./../models/menuItem");
const { authMiddleware, generateToken} = require("./../middlewares/authMiddleware");
const { default: mongoose } = require("mongoose");
const { off } = require("../models/user");


// POST route to add menu items in  a restaurant (Only restaurant owner)
router.post("/:id/menu", authMiddleware, async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const data = req.body;

        // Validate if the provided ID is mongoose ObjectId
        if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid restaurant ID"});
        }
        
        // Check Restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        
        if(!restaurant) {
            return res.status(404).json({msg: "Restaurant not found"});
        }

        // Ensure only restaurant owner can add menu
        if(restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized, Only restaurant owner can add menu items"});
        }

        // Create a menu item
        const newMenuItem = new MenuItem(data);

        // save menu item to database
        await newMenuItem.save();

        res.status(200).json({msg: "Menu item added successfully", menuItem: newMenuItem});

    } catch (error) {
        console.log("Error adding menu item in a restaurant", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get Restaurant menu
router.get("/:id/menu", async (req, res) => {
    try {
        const restaurantId = req.params.id;

        // Validate if the provided ID is a valid mongoose objectId
        if(!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({msg: "Invalid restaurant ID"});
        }

        // Check restauran exists
        const restaurant = await Restaurant.findById(restaurantId);

        if(!restaurant) {
            return res.status(404).json({msg: "No resturant found"});
        }

        // Fetching menu items
        const menuItems = await MenuItem.find({ restaurantId: restaurantId });

        if(menuItems.length === 0) {
            return res.status(404).json({msg: "No menu items found for this restaurant"});
        }

        res.status(200).json({menu: menuItems});

    } catch (error) {
        console.log("Error fetching restaurant menu", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update menu item (only restaurant owner)
router.put("/menu/:menuItemId", authMiddleware, async (req, res) => {
    try {
        const {menuItemId} = req.params;
        const updates = req.body;
        
        // Validate if the provided menuItemId is a valid mongoose objectId
        if(!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({msg: "Invalid menu item ID"});
        }

        // Find the menuItem
        const menuItem = await MenuItem.findById(menuItemId);
        if(!menuItem) {
            return res.status(404).json({msg: "No menu item found"});
        }

        // Find the restaurant linked to this menu item
        const restaurant = await Restaurant.findById(menuItem.restaurantId)
        if(!restaurant) {
            return res.status(404).json({msg: "No restaurant found"});
        }

        // Enure only restaurant owner can update menu item
        if(restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized, Only restaurant owner can update menu items"});
        }

        // Update meun item
        const updatedMenuItems = await MenuItem.findByIdAndUpdate(menuItemId, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({msg: "Menu item updated successfully", updatedMenuItems: updatedMenuItems});
        
    } catch (error) {
        console.log("Error updating menu item", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Delete menu item (only restaurant owner)
router.delete("/menu/:menuItemId", authMiddleware, async (req, res) => {
    try {
        const {menuItemId} = req.params;

        // Validate if provided menuItemId is valid mongoose objectId
        if(!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({msg: "Invalid menuItem ID"});
        }

        // Find menu item
        const menuItem = await MenuItem.findById(menuItemId);

        if(!menuItem) {
            return res.status(404).json({msg: "No menuItem found"});
        }

        // Find the restaurant linked to this menu item
        const restaurant = await Restaurant.findById(menuItem.restaurantId);

        if(!restaurant) {
            return res.status(404).json({msg: "No restaurant found"});
        }

        // Ensure only restaurant owner can delete menu item
        if(restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized, You cannot delete this menu item"});
        }

        await MenuItem.findByIdAndDelete(menuItemId, menuItem);

        res.status(200).json({msg: "Menu item deleted successfully"});

    } catch (error) {
        console.log("Error deleting menu items", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

module.exports = router;