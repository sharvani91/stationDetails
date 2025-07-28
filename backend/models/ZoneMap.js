const mongoose = require('mongoose');
const ZoneSchema = new mongoose.Schema({
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

module.exports = mongoose.model('zoneMap', ZoneSchema);