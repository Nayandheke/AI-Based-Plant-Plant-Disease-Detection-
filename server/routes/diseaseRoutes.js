const express = require('express');
const router = express.Router();
const { analyzeLeaf, getHistory } = require('../controllers/diseaseController');
const upload = require('../middleware/upload');

router.post('/analyze', upload.single('image'), analyzeLeaf);
router.get('/history', getHistory);

module.exports = router;
