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

// @desc    Get all connections for a user
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ user_id: req.user._id }).select('-connection_string_encrypted').sort('-created_at');
    res.status(200).json({ success: true, count: connections.length, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a connection
// @route   DELETE /api/connections/:id
// @access  Private
const deleteConnection = async (req, res) => {
  try {
    const connection = await Connection.findOne({ _id: req.params.id, user_id: req.user._id });
    
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }
    
    await connection.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  addConnection,
  testConnection,
  getConnections,
  deleteConnection,
};
