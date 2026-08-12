const express = require('express');
const router = express.Router();
const { generateQuery, executeQueryEndpoint, getQueryHistory } = require('../controllers/queryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQuery);
router.post('/execute', protect, executeQueryEndpoint);
router.get('/history', protect, getQueryHistory);

module.exports = router;
