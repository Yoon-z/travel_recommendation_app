const mongoose = require('mongoose')

const eventsSchema = new mongoose.Schema({
    user_id: String,
    event_name: String,
    description: String,
    event_time: String,
    event_location: String,
    carbon_offset_estimation: Number,
    eco_activities: [],
    xp_rewards: Number,
    event_image: String
})

const eventsModel = mongoose.model("events", eventsSchema)
module.exports = eventsModel