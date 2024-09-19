const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true }
});

const Station = mongoose.model('Station', StationSchema);
module.exports = Station;
