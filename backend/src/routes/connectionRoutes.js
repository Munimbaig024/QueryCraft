const express = require('express');
const router = express.Router();
const { addConnection, testConnection, getConnections, deleteConnection } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConnections);
router.post('/', protect, addConnection);
router.delete('/:id', protect, deleteConnection);
router.post('/test', protect, testConnection);

module.exports = router;
