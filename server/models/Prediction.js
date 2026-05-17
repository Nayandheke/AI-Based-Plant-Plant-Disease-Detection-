const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    diseaseClass: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    imagePath: {
        type: String
    },
    remedy: {
        description: String,
        organic: [String],
        chemical: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
