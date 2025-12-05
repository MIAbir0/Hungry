const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
require("./config/db")();

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS FIXED for phone access
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://192.168.68.100:5500",
        "http://192.168.68.100:5000"
    ],
    credentials: true
}));

// Serve Frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// Root Route => serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Start Server (MOBILE ACCESS ENABLED)
app.listen(5000, "0.0.0.0", () => {
    console.log("🚀 Server running on http://192.168.68.100:5000");
});
