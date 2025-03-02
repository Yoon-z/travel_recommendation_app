const mongoose = require('mongoose');

const userGroupSchema = new mongoose.Schema({
    userIndex: String,
    savedAttractions: [],
});

const groupModel = mongoose.model("user_groups", userGroupSchema)
module.exports = groupModel;