const express = require("express");
const dotenv = require("dotenv");
const db = require("./db");
const app = express();

dotenv.config();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Importing the routes
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuItemRoutes = require("./routes/menuItemsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Use the routes
app.use("/user", userRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/menuItem", menuItemRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

app.listen(PORT, () => console.log(`Listening on server ${PORT}`));