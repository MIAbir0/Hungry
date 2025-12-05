const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "hungry_secret_key_2024";

exports.createOrder = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ success: false, message: "Not logged in" });

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Ensure items are properly formatted
        const items = (req.body.items || []).map(item => ({
            name: item.name || 'Unknown',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image || ''
        }));
        
        const order = await Order.create({
            userId: decoded.id,
            items: items,
            total: req.body.total || 0,
            deliveryDate: req.body.deliveryDate,
            instructions: req.body.instructions,
            status: "pending"
        });

        res.json({ success: true, order, message: "Order placed successfully" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

exports.myOrders = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ success: false, message: "Not logged in" });

        const decoded = jwt.verify(token, JWT_SECRET);
        
        const orders = await Order.find({ userId: decoded.id }).sort({ date: -1 });

        res.json({ success: true, orders });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};
