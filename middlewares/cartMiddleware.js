const mongoose = require("mongoose");
const MenuItem = require("./../models/menuItem");

const cartMiddleware = async (req, res, next) => {
    try {
        const { menuItemId, quantity} = req.body;
        // console.log("menuItemId from cartMiddleware",menuItemId);

        // Validate menuItemId
        if(!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({msg : "Invalid menuItem ID"});
        }

        // Validate quantity
        const numericQuantity = Number(quantity);
        if(!numericQuantity || numericQuantity <= 0) {
            return res.status(400).json({msg: "Quantity must be greater than zero"});
        }

        // Check if item exists
        const item = await MenuItem.findById(menuItemId);

        if(!item) {
            return res.status(404).json({msg: "No item found"});
        }

        next();

    } catch (error) {
        console.log("Error in cartMiddleware", error);
        res.status(500).json({msg: "Internal server error"});
    }
}

module.exports = cartMiddleware;