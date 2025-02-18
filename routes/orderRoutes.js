const express = require("express");
const mongoose = require("mongoose");
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


// Get route to view orders of user's
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        if(!userId) {
            res.status(401).json({msg: "Unauthorized, User not found"});
        }

        // Find all orders for the logged-in user and populate menu items to get their names
        const orders = await Order.find({userId}).populate("items.menuItemId", "name price");

        if(!orders || orders.length === 0) {
            return res.status(500).json({msg: "No orders found"});
        }

        res.status(200).json({orders});

    } catch (error) {
        console.log("Error fetching user orders", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get orders details
router.get("/:orderId", authMiddleware, async (req, res) => {
    try {
        const {orderId} = req.params;
        const userId = req.user.id
        
        // Validate if provided orderId is a valid mongoose objectId
        if(!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({msg: "Invalid order ID"});
        }

        // Find the order
        const order = await Order.findOne({_id: orderId, userId})
            .populate("items.menuItemId", "name price")
            .populate("restaurantId", "name address");

        if(!order) {
            return res.status(404).json({msg: "Order not found"});
        }

        res.status(200).json({ order });
        
    } catch (error) {
        console.log("Error fetching orders details", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


module.exports = router;