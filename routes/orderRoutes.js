const express = require("express");
const router = express.Router();
const Order = require("./../models/order");
const Cart = require("../models/cart");
const { authMiddleware, generateToken} = require("./../middlewares/authMiddleware");

// POST route to place order
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        if(!userId) {
            return res.status(400).json({msg: "Unauthorized: User not found"});
        }

        // Find the user's cart
        const cart = await Cart.findOne({userId}).populate("items.menuItemId", "name price restaurantId");

        if(!cart || cart.items.length === 0) {
            return res.status(400).json({msg: "You cart is empty, Add items before placing order"});
        }

        // Get restaurantId from first item (assuming all items from the same restaurant)
        const restaurantId = cart.items[0].menuItemId.restaurantId;

        // Create new order
        const newOrder = new Order({
            userId,
            restaurantId,
            items: cart.items.map(item => ({
                menuItemId: item.menuItemId._id,
                quantity: item.quantity,
                price: item.menuItemId.price,
            })),
            total: cart.total,
            status: "pending",
        });

        // Save to database
        await newOrder.save();

        // Clear the user's cart after placing an order
        await Cart.findOneAndDelete({userId});

        res.status(201).json({msg: "Order placed successfully", order: newOrder});

    } catch (error) {
        console.log("Error placing order", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


module.exports = router;