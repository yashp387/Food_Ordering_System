const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Cart = require("./../models/cart");
const User = require("./../models/user");
const { authMiddleware, generateToken} = require("./../middlewares/authMiddleware");
const cartMiddleware = require("./../middlewares/cartMiddleware");
const MenuItem = require("../models/menuItem");

// POST router to add item to cart
router.post("/", authMiddleware, cartMiddleware, async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;
        const userId = req.user.id;

       // Find the menu item to get its price
       const menuItem = await MenuItem.findById(menuItemId);

        if(!menuItem) {
            return res.status(404).json({msg: "Menu item not found"});
        }

        // Check if the item ia already in the cart
        let cart = await Cart.findOne({userId});
        if(!cart) {
            // If the user doen't have a cart, crate a new one
            cart = new Cart({ userId, item: [], total: 0});
        }

        let cartItem = cart.items.find(item => item.menuItemId.toString() === menuItemId.toString());

        if(cartItem) {
            // If the item exists, update the quantity
            cartItem.quantity += quantity;
        } else {
            // Otherwise, add a new item to a cart
            cart.items.push({
                menuItemId,
                quantity,
                price: menuItem.price,
            });
        }

        // Recalculate the total price
        cart.total = cart.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);

        // save the updated cart
        await cart.save();

        res.status(200).json({msg: "Item added to a cart successfully", cart});

    } catch (error) {
        console.log("Error addint item to cart", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

module.exports = router;