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
            cart = new Cart({ userId, items: [], total: 0});
        }

        let cartItem = cart.items.find(item => item.menuItemId.toString() === menuItemId.toString());

        if(cartItem) {
            // If the item exists, update the quantity
            cartItem.quantity += quantity;
        } else {
            // Otherwise, add a new item to a cart
            cart.items.push({
                menuItemId,
                name: menuItemId.name,    // Includes name of item
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

        // Populate the menuItem to get name of item in response
        const populatedCart = await Cart.findById(cart.id).populate("items.menuItemId", "name");

        res.status(200).json({msg: "Item added to a cart successfully", cart: populatedCart});

    } catch (error) {
        console.log("Error addint item to cart", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// View cart
router.get("/", async (req, res) => {
    try {
        const cart = await Cart.find().populate("items.menuItemId", "name");
        if(!cart) {
            return res.status(500).json({msg: "No cart found"});
        }     
        res.status(200).json({cart});

    } catch (error) {
        console.log("Error fetching cart", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update the cart item
router.put("/:menuItemId", authMiddleware, cartMiddleware, async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        // Find the user's cart
        const cart = await Cart.findOne({userId});

        if(!cart) {
            return res.status(404).json({msg: "No cart found for this user"});
        }

        // Find the specific menuItemId in cart
        let cartItem = cart.items.find(item => item.menuItemId.toString() === menuItemId);

        if(!cartItem) {
            return res.status(404).json({msg: "Item not found in the cart"});
        }

        // Update the item's quantity
        cartItem.quantity = quantity;

        // Recalculate the total price
        cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json({msg: "Cart updated successfully", cart});
        
    } catch (error) {
        console.log("Error updating cart", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// remove item from cart
router.delete("/:menuItemId", authMiddleware, async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const userId = req.user.id;

        // Validate menuItemId
        if(!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({msg : "Invalid menuItem ID"});
        }

        // Find the user's cart
        const cart = await Cart.findOne({userId});

        if(!cart) {
            return res.status(404).json({msg: "No cart found"});
        }

        // Find index of the item to be removed
        const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

        if(itemIndex === -1) {
            return res.status(404).json({msg: "Item not found in the cart"});
        }

        // Remove the item from the cart's items array
        cart.items.splice(itemIndex, 1);

        // Recalculate the total price
        cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json({msg: "Item removed from the cart successfully", cart});

    } catch (error) {
        console.log("Error removing item from the cart", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Delete the cart
router.delete("/:cartId/cart", authMiddleware, async (req, res) => {
    try {
         const { cartId } = req.params;
         const userId = req.user.id;
         
         // Validate if provided cartId is valid mongoose objectId
         if(!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({msg: "Invalid cart ID"});
         }

         // Find and delete the cart only if it belongs to the user
         const deletedCart = await Cart.findOneAndDelete({_id: cartId, userId});

         if(!deletedCart) {
            return res.status(404).json({msg: "No cart found or Unauthorized"});
         }
         
         res.status(200).json({msg: "Cart deleted successfully", deletedCart});

    } catch (error) {
        console.log("Error deleting cart", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


module.exports = router;