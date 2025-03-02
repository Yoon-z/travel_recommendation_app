const mongoose = require('mongoose');

const userPrefSchema = new mongoose.Schema({
    userId: String,
    preference: [],
});

const prefModel = mongoose.model("user_preferences", userPrefSchema)
module.exports = prefModel;