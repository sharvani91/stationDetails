const mongoose = require('mongoose');
const MapSchema = new mongoose.Schema({
    stationName: {
        type: String,
        required: true
    },
    zoneName: {
        type: String,
        required: true
    },
    image: {
        type: Buffer,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('stationMap', MapSchema);