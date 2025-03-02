const mongoose = require('mongoose')
require('dotenv').config();
const mongoUri = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected.')
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
module.exports = connectDB
