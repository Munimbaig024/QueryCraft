const Connection = require('../models/Connection');
const { introspectDatabase } = require('../utils/schemaIntrospection');
const { generateSQLFromPrompt } = require('../services/llmService');

// @desc    Generate SQL query from natural language
// @route   POST /api/query/generate
// @access  Private
const generateQuery = async (req, res) => {
  try {
    const { connectionId, prompt } = req.body;

    if (!connectionId || !prompt) {
      return res.status(400).json({ message: 'Connection ID and prompt are required' });
    }

    // 1. Fetch connection details ensuring it belongs to the user
    const connection = await Connection.findOne({ _id: connectionId, user_id: req.user._id });

    if (!connection) {
      return res.status(404).json({ message: 'Database connection not found' });
    }

    // 2. Get database schema context
    const schemaContext = await introspectDatabase(connection.db_type, connection.connection_string_encrypted);

    // 3. Pass to LLM to generate SQL
    const generated = await generateSQLFromPrompt(prompt, schemaContext);

    // Return the generated SQL and visualization recommendation
    res.status(200).json({
      success: true,
      sql: generated.sql,
      visualization: generated.visualization,
    });
  } catch (error) {
    console.error('Query Generation Error:', error);
    res.status(500).json({ message: 'Error generating query', error: error.message });
  }
};

module.exports = {
  generateQuery,
};
