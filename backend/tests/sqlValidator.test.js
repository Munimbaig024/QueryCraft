const { validateSql } = require('../src/utils/sqlValidator');

describe('SQL AST Security Validator', () => {
  it('should allow basic SELECT statements', () => {
    const sql = "SELECT * FROM users";
    expect(() => validateSql(sql)).not.toThrow();
  });

  it('should allow complex SELECT statements with JOINs and grouping', () => {
    const sql = "SELECT u.name, SUM(o.total) as revenue FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name HAVING revenue > 100";
    expect(() => validateSql(sql)).not.toThrow();
  });

  it('should strictly block DROP TABLE statements', () => {
    const sql = "DROP TABLE users";
    expect(() => validateSql(sql)).toThrow(/Only SELECT queries are allowed/);
  });

  it('should strictly block DELETE statements', () => {
    const sql = "DELETE FROM users WHERE id = 1";
    expect(() => validateSql(sql)).toThrow(/Only SELECT queries are allowed/);
  });

  it('should strictly block UPDATE statements', () => {
    const sql = "UPDATE users SET is_admin = true";
    expect(() => validateSql(sql)).toThrow(/Only SELECT queries are allowed/);
  });

  it('should strictly block INSERT statements', () => {
    const sql = "INSERT INTO users (name, email) VALUES ('Hacker', 'hack@hack.com')";
    expect(() => validateSql(sql)).toThrow(/Only SELECT queries are allowed/);
  });
  
  it('should throw an error for malformed SQL syntax', () => {
    const sql = "SELECT * FROM";
    expect(() => validateSql(sql)).toThrow();
  });
});
