const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    phone: String,
    address: String,
    city: String,
    postal: String
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
