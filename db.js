const mongoose = require("mongoose");
require("dotenv").config();

// Connection to database
const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL);

// Get database connection instance
const db = mongoose.connection;

// Connection success
db.on("connected", () => {
    console.log("Connected to mongoDB server");
});

// Connection error (Fixed)
db.on("error", (err) => {
    console.log("MongoDB server error",err);
});

// Connection disconnected
db.on("disconnected", () => {
    console.log("MongoDB server disconnected");
});


module.exports = db;