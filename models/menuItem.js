const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ["Appetizer", "Main Course", "Dessert", "Drink", "Other"],
    },
    available: {
        type: Boolean,
        default: true,
    },
}, { timestamps:true });


const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;