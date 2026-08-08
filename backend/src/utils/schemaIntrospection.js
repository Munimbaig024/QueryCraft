const { Client } = require('pg');
const mysql = require('mysql2/promise');
const { decrypt } = require('./encryption');

/**
 * Fetch schema from PostgreSQL
 */
const getPostgresSchema = async (connectionString) => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    
    // Group by table
    const schema = {};
    res.rows.forEach((row) => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });

    return formatSchemaString(schema);
  } finally {
    await client.end();
  }
};

/**
 * Fetch schema from MySQL
 */
const getMysqlSchema = async (connectionString) => {
  let connection;
  try {
    connection = await mysql.createConnection(connectionString);
    const [rows] = await connection.execute(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE()
      ORDER BY table_name, ordinal_position;
    `);

    // Group by table
    const schema = {};
    rows.forEach((row) => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });

    return formatSchemaString(schema);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const formatSchemaString = (schemaObj) => {
  let result = '';
  for (const [table, columns] of Object.entries(schemaObj)) {
    result += `Table: ${table}\nColumns: ${columns.join(', ')}\n\n`;
  }
  return result;
};

/**
 * Introspect database schema based on dbType and connection config
 * @param {string} dbType 
 * @param {string} encryptedConnectionString 
 * @returns {Promise<string>} Formatted schema context
 */
const introspectDatabase = async (dbType, encryptedConnectionString) => {
  const connectionString = decrypt(encryptedConnectionString);

  switch (dbType.toLowerCase()) {
    case 'postgres':
      return await getPostgresSchema(connectionString);
    case 'mysql':
      return await getMysqlSchema(connectionString);
    default:
      // Return a mock schema for unsupported types for now
      return 'Table: MockTable\nColumns: id (int), name (varchar), created_at (timestamp)\n';
  }
};

module.exports = {
  introspectDatabase,
};
