const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let dbPool = null;
let sqliteDb = null;
let isUsingSqlite = process.env.USE_SQLITE === 'true';

// Helper to initialize SQLite schema
function initSqlite(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      address TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles (id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      owner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (store_id) REFERENCES stores (id),
      UNIQUE(user_id, store_id)
    );
  `);
}

async function getDbConnection() {
  if (isUsingSqlite) {
    if (!sqliteDb) {
      const Database = require('better-sqlite3');
      const dbPath = path.resolve(__dirname, '../../', process.env.SQLITE_DB_PATH || 'store_rating.sqlite');
      sqliteDb = new Database(dbPath);
      sqliteDb.pragma('foreign_keys = ON');
      initSqlite(sqliteDb);
      console.log('⚡ Connected to SQLite database:', dbPath);
    }
    return 'sqlite';
  }

  if (!dbPool) {
    try {
      const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'store_rating_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      const connection = await pool.getConnection();
      connection.release();

      dbPool = pool;

      console.log(
        `✅ Connected to MySQL database "${process.env.DB_NAME}" at ${process.env.DB_HOST}`
      );
    } catch (err) {
      console.error('❌ MySQL connection failed:', err.message);
      throw err;
    }
  }

  return 'mysql';
}

/**
 * Universal query runner for MySQL and SQLite
 */
async function query(sql, params = []) {
  const dbType = await getDbConnection();

  if (dbType === 'sqlite') {
    // Convert MySQL positional ? or syntax if needed (both use ?)
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH');
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    const isUpdate = sql.trim().toUpperCase().startsWith('UPDATE');
    const isDelete = sql.trim().toUpperCase().startsWith('DELETE');

    try {
      if (isSelect) {
        const stmt = sqliteDb.prepare(sql);
        const rows = stmt.all(params);
        return [rows];
      } else {
        const stmt = sqliteDb.prepare(sql);
        const info = stmt.run(params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
      }
    } catch (err) {
      console.error('SQLite Query Error:', err.message, 'SQL:', sql);
      throw err;
    }
  } else {
    // MySQL2
    try {
      const [results] = await dbPool.execute(sql, params);
      return [results];
    } catch (err) {
      console.error('MySQL Query Error:', err.message, 'SQL:', sql);
      throw err;
    }
  }
}

module.exports = {
  query,
  getDbConnection
};
