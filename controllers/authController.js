const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "hungry_secret_key_2024";

exports.signup = async (req, res) => {
    try {
        const { fullName, email, phone, address, city, postal } = req.body;

        if (!fullName || !email || !phone) {
            return res.json({ success: false, message: "Full name, email and phone are required" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email already used" });
        }

        const user = await User.create({
            fullName,
            email,
            phone: "+880" + phone.replace(/^\+?880/, ""),
            address: address || "",
            city: city || "",
            postal: postal || ""
        });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });

        res.json({ success: true, message: "Account created successfully" });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.json({ success: false, message: "Email and phone are required" });
        }

        const formattedPhone = "+880" + phone.replace(/^\+?880/, "");
        const user = await User.findOne({ email, phone: formattedPhone });

        if (!user) {
            return res.json({ success: false, message: "User not found or phone doesn't match" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });
        res.json({ success: true, message: "Login successful", user: { fullName: user.fullName, email: user.email, phone: user.phone, address: user.address } });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out" });
};

exports.getProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json({ success: false, message: "Not logged in" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });

    } catch (err) {
        res.json({ success: false, message: "Invalid token" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json({ success: false, message: "Not logged in" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { fullName, phone, address, city, postal } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phone) updateData.phone = "+880" + phone.replace(/^\+?880/, "");
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (postal !== undefined) updateData.postal = postal;

        const user = await User.findByIdAndUpdate(decoded.id, updateData, { new: true });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully", user });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};
