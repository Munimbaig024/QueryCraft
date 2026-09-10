const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'dummy.db');

// Remove existing database to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite dummy database.');
});

db.serialize(() => {
  console.log('Creating tables...');
  
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      join_date DATE NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      order_date DATE NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )
  `);

  console.log('Inserting dummy data...');

  const usersStmt = db.prepare('INSERT INTO users (name, email, join_date) VALUES (?, ?, ?)');
  usersStmt.run('Alice Smith', 'alice@example.com', '2023-01-15');
  usersStmt.run('Bob Johnson', 'bob@example.com', '2023-02-20');
  usersStmt.run('Charlie Brown', 'charlie@example.com', '2023-03-05');
  usersStmt.run('Diana Prince', 'diana@example.com', '2023-04-10');
  usersStmt.run('Evan Wright', 'evan@example.com', '2023-05-22');
  usersStmt.finalize();

  const productsStmt = db.prepare('INSERT INTO products (product_name, category, price) VALUES (?, ?, ?)');
  productsStmt.run('Laptop Pro', 'Electronics', 1299.99);
  productsStmt.run('Wireless Mouse', 'Accessories', 49.99);
  productsStmt.run('Mechanical Keyboard', 'Accessories', 109.50);
  productsStmt.run('Coffee Mug', 'Home', 15.00);
  productsStmt.run('Noise Cancelling Headphones', 'Electronics', 249.99);
  productsStmt.finalize();

  const ordersStmt = db.prepare('INSERT INTO orders (user_id, product_id, quantity, order_date) VALUES (?, ?, ?, ?)');
  ordersStmt.run(1, 1, 1, '2023-06-01');
  ordersStmt.run(1, 2, 2, '2023-06-05');
  ordersStmt.run(2, 3, 1, '2023-06-10');
  ordersStmt.run(3, 4, 3, '2023-06-12');
  ordersStmt.run(4, 5, 1, '2023-06-15');
  ordersStmt.run(5, 1, 1, '2023-06-20');
  ordersStmt.run(5, 4, 2, '2023-06-25');
  ordersStmt.finalize();
});

db.close((err) => {
  if (err) {
    console.error('Error closing database', err);
  } else {
    console.log('Dummy database created successfully! File saved as "dummy.db"');
    console.log('You can now add it to QueryCraft with connection string: sqlite://dummy.db');
  }
});
