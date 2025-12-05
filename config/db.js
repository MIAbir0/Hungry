const mongoose = require("mongoose");

const CONNECTION_URI = process.env.MONGO_URI || "mongodb+srv://itsmiabir:Hum555@webproject.ukm82sb.mongodb.net/hungry?retryWrites=true&w=majority";

module.exports = async () => {
    try {
        mongoose.set('bufferCommands', false);
        await mongoose.connect(CONNECTION_URI);
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("DB Error:", err);
        process.exit(1);
    }
};
