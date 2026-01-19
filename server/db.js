const mysql = require("mysql2/promise");

// adjust these to your XAMPP setup
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",       // default in XAMPP
  database: "profitkingdom"
};

let connection;

async function initDB() {
  connection = await mysql.createConnection(dbConfig);
  console.log("Connected to MySQL database.");

  // Create tables if they don't exist
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS players (
      wallet_id VARCHAR(255) PRIMARY KEY,
      health INT DEFAULT 100,
      mana INT DEFAULT 100,
      energy INT DEFAULT 100,
      silver INT DEFAULT 0,
      gold INT DEFAULT 0,
      credits INT DEFAULT 0,
      x INT DEFAULT 0,
      y INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS inventory (
      wallet_id VARCHAR(255),
      item_id VARCHAR(255),
      quantity INT DEFAULT 1,
      PRIMARY KEY (wallet_id, item_id),
      FOREIGN KEY (wallet_id) REFERENCES players(wallet_id)
    )
  `);

  return connection;
}

module.exports = { initDB, connection };
