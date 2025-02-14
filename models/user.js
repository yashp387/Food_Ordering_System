const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    cart: [
        {
            foodItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FoodItem",
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        }
    ],
}, { timestamps: true });


userSchema.pre("save", async function (next) {
    const user = this;

    // Hash the password only if it has been modified or it is a new password
    if(!user.isModified("password")) return next();

    try {
        // Hash password generation
        const salt = await bcrypt.genSalt(10);

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Override the plain password with hashedPassword
        user.password = hashedPassword;
        next();

    } catch (error) {
        return next(error);
    }
});


userSchema.methods.comparePassword = async function(inputPassword) {
    try {
        // Use bcrypt to compare provided password with the hashedPassword
        const isMatch = await bcrypt.compare(inputPassword, this.password);
        return isMatch;
    } catch (error) {
        throw new Error("Error comparing passwords");
    }
}


const User = mongoose.model("User", userSchema);

module.exports = User;