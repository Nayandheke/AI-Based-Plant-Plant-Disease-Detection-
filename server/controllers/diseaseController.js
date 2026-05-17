const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Prediction = require('../models/Prediction');
const remedies = require('../utils/remedies.json');

/**
 * Analyze uploaded leaf image
 */
const analyzeLeaf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        // Prepare image for AI Engine
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path));

        // Call AI Engine
        let aiResponse;
        try {
            aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/predict`, form, {
                headers: form.getHeaders(),
                timeout: 10000 // 10 second timeout
            });
        } catch (err) {
            // Handle Gatekeeper (422) rejection
            if (err.response && err.response.status === 422) {
                return res.status(422).json(err.response.data);
            }
            console.error('AI Engine Connection Error:', err.message);
            return res.status(503).json({ error: 'AI Engine is currently unreachable' });
        }

        const { disease_class, confidence } = aiResponse.data.prediction;

        // Fetch Remedy & Details
        const rawClass = disease_class; // e.g., "Apple___Apple_scab"
        const cleanName = rawClass.replace(/___/g, ' ').replace(/_/g, ' ');
        
        const remedy = remedies[rawClass] || {
            description: "Detailed information for this specific condition is being updated.",
            organic: ["Ensure proper watering and soil nutrition."],
            chemical: ["Consult a local agricultural expert for verified treatments."]
        };

        // Save to Database (Optional)
        const prediction = new Prediction({
            diseaseClass: cleanName,
            confidence: confidence,
            imagePath: req.file.path,
            remedy: remedy
        });
        await prediction.save();

        // Final Response
        return res.json({
            disease: cleanName,
            confidence: confidence,
            remedy: remedy
        });

    } catch (error) {
        console.error('Backend Controller Error:', error);
        return res.status(500).json({ error: 'Internal Server Error during diagnosis' });
    }
};

/**
 * Get recent activity (unused in current simplified UI but kept for API)
 */
const getHistory = async (req, res) => {
    try {
        const history = await Prediction.find().sort({ createdAt: -1 }).limit(10);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { analyzeLeaf, getHistory };
