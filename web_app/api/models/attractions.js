const mongoose = require('mongoose')

const attractionSchema = new mongoose.Schema({
    address: String,
    cid: String,
    city: String,
    fid: String,
    imageUrl: String,
    'location/lat': Number,
    'location/lng': Number,
    placeId: String,
    postalCode: Number,
    street: String,
    title: String,
    nature: Number,
    animal: Number,
    architect: Number,
    history: Number,
    culture: Number,
    hiking: Number,
    park: Number,
    meseum: Number,
    religion: Number,
    amusement: Number,
    senic: Number,
    botanical: Number,
    sport: Number,
    saveCount: Number,
})

const attractionModel = mongoose.model("attractions", attractionSchema)
module.exports = attractionModel