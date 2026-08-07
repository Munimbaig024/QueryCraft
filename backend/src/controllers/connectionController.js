const Connection = require('../models/Connection');
const { encrypt, decrypt } = require('../utils/encryption');

// @desc    Add new database connection
// @route   POST /api/connections
// @access  Private
const addConnection = async (req, res) => {
  try {
    const { nickname, db_type, connection_string } = req.body;

    const connection = await Connection.create({
      user_id: req.user._id,
      nickname,
      db_type,
      connection_string_encrypted: encrypt(connection_string),
    });

    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: 'Error adding connection', error: error.message });
  }
};

// @desc    Test a database connection
// @route   POST /api/connections/test
// @access  Private
const testConnection = async (req, res) => {
  try {
    const { db_type, connection_string } = req.body;

    // Placeholder logic for testing a connection
    // In a real scenario, you'd use pg, mysql2, etc., to attempt a connection
    // For now, we simulate a successful connection
    if (['postgres', 'mysql', 'sqlite', 'mongodb'].includes(db_type)) {
      if (connection_string) {
        return res.status(200).json({ success: true, message: 'Connection successful' });
      }
    }
    
    res.status(400).json({ success: false, message: 'Failed to connect to database' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error testing connection', error: error.message });
  }
};

module.exports = {
  addConnection,
  testConnection,
};
