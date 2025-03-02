const mongoose = require('mongoose')

const userEventsSchema = new mongoose.Schema({
    event_id: String,
    user_id: String,
    join_time: String,
    xp_rewards: Number,
    carbon_offset_estimation: Number
})

const userEventsModel = mongoose.model("user_events", userEventsSchema)
module.exports = userEventsModel