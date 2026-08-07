const express = require('express');
const router = express.Router();
const { addConnection, testConnection } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addConnection);
router.post('/test', protect, testConnection);

module.exports = router;
