const mongoose = require('mongoose');

const attractionClusterSchema = new mongoose.Schema({
    ids_list: [],
});

const attraClusterModel = mongoose.model('attraction_clusters', attractionClusterSchema);
module.exports = attraClusterModel;