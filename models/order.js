const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    items: [
        {
            menuId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MenuItem",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                min: 0,
                required: true,
            },
            subTotal: {
                type: Number,
                required: true,
                default: 0,
            }
        }
    ],
    total: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "delivered", "preparing", "cancelled"],
        default: "pending",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    }
}, {timestamps: true});


// Auto update total before saving the total
orderSchema.pre("save", function(next) {
    this.items.forEach((item) => {
        item.subTotal = item.price * item.quantity;
    });

    this.total = this.items.reduce((sum, item) => sum + item.subTotal, 0);
    next();
});


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;