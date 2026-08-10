const { Parser } = require('node-sql-parser');
const parser = new Parser();

/**
 * Validates that an SQL query only contains safe read operations
 * @param {string} sqlQuery - The generated SQL query
 * @throws {Error} if the query contains destructive operations
 * @returns {boolean} true if safe
 */
const validateSqlQuery = (sqlQuery) => {
  try {
    // Parse the query into an AST
    const ast = parser.astify(sqlQuery);
    
    // node-sql-parser returns an array if there are multiple statements
    const statements = Array.isArray(ast) ? ast : [ast];

    for (const stmt of statements) {
      // Only allow SELECT statements
      if (stmt.type.toLowerCase() !== 'select') {
        throw new Error(`Unsafe operation detected: ${stmt.type.toUpperCase()} is not allowed. Only SELECT queries are permitted.`);
      }
    }

    return true;
  } catch (error) {
    if (error.message.includes('Unsafe operation detected')) {
      throw error;
    }
    // If it fails to parse, we should block it to prevent SQL injection or execution errors
    throw new Error('Failed to parse SQL query or invalid syntax: ' + error.message);
  }
};

module.exports = {
  validateSqlQuery,
};
