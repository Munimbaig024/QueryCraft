const express = require('express');
const router = express.Router();
const { generateQuery } = require('../controllers/queryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQuery);

module.exports = router;
