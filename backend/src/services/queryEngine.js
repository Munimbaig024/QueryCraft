const { Client } = require('pg');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const { decrypt } = require('../utils/encryption');
const { validateSqlQuery } = require('../utils/sqlValidator');

/**
 * Executes query in a PostgreSQL read-only transaction
 */
const executePostgres = async (connectionString, sqlQuery) => {
  const client = new Client({ connectionString });
  const startTime = Date.now();
  try {
    await client.connect();
    // Enforce read-only transaction at the database level
    await client.query('BEGIN READ ONLY');
    const res = await client.query(sqlQuery);
    await client.query('COMMIT');
    
    return { 
      data: res.rows, 
      executionTimeMs: Date.now() - startTime 
    };
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Executes query in a MySQL read-only transaction
 */
const executeMysql = async (connectionString, sqlQuery) => {
  let connection;
  const startTime = Date.now();
  try {
    connection = await mysql.createConnection(connectionString);
    // Enforce read-only transaction at the database level
    await connection.query('START TRANSACTION READ ONLY');
    const [rows] = await connection.query(sqlQuery);
    await connection.query('COMMIT');
    
    return { 
      data: rows, 
      executionTimeMs: Date.now() - startTime 
    };
  } catch (error) {
    if (connection) await connection.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Executes query in a SQLite database
 */
const executeSqlite = async (connectionString, sqlQuery) => {
  const dbPath = connectionString.replace(/^sqlite:\/\//, '');
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });

    db.all(sqlQuery, [], (err, rows) => {
      db.close();
      if (err) return reject(err);
      
      resolve({
        data: rows,
        executionTimeMs: Date.now() - startTime
      });
    });
  });
};

/**
 * Main engine entry point for executing validated queries
 * @param {string} dbType 
 * @param {string} encryptedConnectionString 
 * @param {string} sqlQuery 
 */
const executeQuery = async (dbType, encryptedConnectionString, sqlQuery) => {
  // Final AST safety net before execution
  validateSqlQuery(sqlQuery);

  const connectionString = decrypt(encryptedConnectionString);

  switch (dbType.toLowerCase()) {
    case 'postgres':
      return await executePostgres(connectionString, sqlQuery);
    case 'mysql':
      return await executeMysql(connectionString, sqlQuery);
    case 'sqlite':
      return await executeSqlite(connectionString, sqlQuery);
    default:
      throw new Error(`Execution engine currently does not support dynamic queries for ${dbType}`);
  }
};

module.exports = {
  executeQuery,
};
