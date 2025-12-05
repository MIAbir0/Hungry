const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    image: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    userId: String,
    items: [OrderItemSchema],
    total: Number,
    deliveryDate: String,
    instructions: String,
    status: { type: String, default: "pending" },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
