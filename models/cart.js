const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            menuItemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MenuItem",
                required: true,
            },
            quantity: {
                type: Number,
                min: 1,
                required: true,
            },
            price: {
                type: Number,
                min: 0,
                required: true,
            }
        }
    ],
    total: {
        type: Number,
        required: true,
        default: 0,
    },

}, {timestamps: true});


// Auto calculate total before saving the total
cartSchema.pre("save", function (next) {
    this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    next();
});


const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;