const express = require('express');
const router = express.Router();
const { generateQuery, executeQueryEndpoint } = require('../controllers/queryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQuery);
router.post('/execute', protect, executeQueryEndpoint);

module.exports = router;
