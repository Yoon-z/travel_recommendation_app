const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    attractionId: String,
    userId: String,
    userName: String,
    like_score: Number,
    green_score: Number,
    review: String,
    imageUrl: String
})

const reviewModel = mongoose.model("reviews", reviewSchema)
module.exports = reviewModel