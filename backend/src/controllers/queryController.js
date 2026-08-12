const Connection = require('../models/Connection');
const QueryHistory = require('../models/QueryHistory');
const { introspectDatabase } = require('../utils/schemaIntrospection');
const { generateSQLFromPrompt } = require('../services/llmService');
const { executeQuery } = require('../services/queryEngine');

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

    // 4. Validate that the LLM actually produced something meaningful
    if (!generated || !generated.sql || generated.sql.trim() === ';') {
      return res.status(422).json({ 
        success: false, 
        message: 'The AI could not generate a valid SQL query from your prompt. Please try rephrasing.' 
      });
    }

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

// @desc    Execute a validated SQL query against a connection
// @route   POST /api/query/execute
// @access  Private
const executeQueryEndpoint = async (req, res) => {
  let success = false;
  let executionTimeMs = 0;
  let errorMessage = null;

  try {
    // Adding 'prompt' to body so we can log the natural query in history
    const { connectionId, sql, prompt } = req.body;

    if (!connectionId || !sql) {
      return res.status(400).json({ message: 'Connection ID and SQL query are required' });
    }

    // Fetch connection ensuring it belongs to user
    const connection = await Connection.findOne({ _id: connectionId, user_id: req.user._id });

    if (!connection) {
      return res.status(404).json({ message: 'Database connection not found' });
    }

    let result;
    try {
      // Execute the query via our secure engine
      result = await executeQuery(connection.db_type, connection.connection_string_encrypted, sql);
      success = true;
      executionTimeMs = result.executionTimeMs;
    } catch (engineError) {
      success = false;
      errorMessage = engineError.message;
      throw engineError;
    } finally {
      // Always log history, whether successful or failed
      try {
        await QueryHistory.create({
          user_id: req.user._id,
          connection_id: connectionId,
          natural_query: prompt || 'Unknown prompt / Direct execution',
          generated_sql: sql,
          execution_time_ms: executionTimeMs,
          success,
          error_message: errorMessage,
        });
      } catch (logError) {
        console.error('Failed to log query history:', logError);
      }
    }

    res.status(200).json({
      success: true,
      data: result.data,
      executionTimeMs: result.executionTimeMs,
    });
  } catch (error) {
    console.error('Query Execution Error:', error);
    // Return a 400 if it's a validation error, 500 otherwise
    const status = error.message.includes('Unsafe operation detected') ? 400 : 500;
    res.status(status).json({ success: false, message: 'Execution failed', error: error.message });
  }
};

// @desc    Get user's query history
// @route   GET /api/query/history
// @access  Private
const getQueryHistory = async (req, res) => {
  try {
    const history = await QueryHistory.find({ user_id: req.user._id })
      .populate('connection_id', 'nickname db_type')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve query history' });
  }
};

module.exports = {
  generateQuery,
  executeQueryEndpoint,
  getQueryHistory,
};
