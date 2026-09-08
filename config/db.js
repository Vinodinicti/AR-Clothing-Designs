const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/inventory.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite Database:', err.message);
    } else {
        console.log(`📦 Connected to SQLite Database at: ${dbPath}`);
    }
});

// Initialize Tables
const initDb = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Items Table
            const createItemsSql = `
                CREATE TABLE IF NOT EXISTS items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL DEFAULT 0.0,
                    status TEXT NOT NULL DEFAULT 'In Stock',
                    description TEXT,
                    image TEXT,
                    original_price REAL,
                    tag TEXT,
                    sizes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Orders Table
            const createOrdersSql = `
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_number TEXT UNIQUE NOT NULL,
                    customer_name TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    customer_phone TEXT,
                    shipping_address TEXT NOT NULL,
                    product_id INTEGER,
                    product_name TEXT NOT NULL,
                    size TEXT,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    unit_price REAL NOT NULL,
                    total_amount REAL NOT NULL,
                    payment_status TEXT NOT NULL DEFAULT 'Paid',
                    order_status TEXT NOT NULL DEFAULT 'Processing',
                    courier_name TEXT DEFAULT 'BlueDart Express',
                    tracking_awb TEXT DEFAULT 'AWB-98421074',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES items(id) ON DELETE SET NULL
                )
            `;

            // Users Table
            const createUsersSql = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    phone TEXT,
                    role TEXT NOT NULL DEFAULT 'customer',
                    status TEXT NOT NULL DEFAULT 'Active',
                    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Cart Items Table
            const createCartSql = `
                CREATE TABLE IF NOT EXISTS cart_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT NOT NULL,
                    user_name TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    product_id INTEGER,
                    size TEXT DEFAULT 'M',
                    quantity INTEGER DEFAULT 1,
                    unit_price REAL NOT NULL,
                    status TEXT DEFAULT 'In Cart',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Liked Items Table
            const createLikesSql = `
                CREATE TABLE IF NOT EXISTS liked_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT NOT NULL,
                    user_name TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    product_id INTEGER,
                    category TEXT,
                    price REAL NOT NULL DEFAULT 0.0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            db.run(createItemsSql);
            db.run(createOrdersSql);
            db.run(createUsersSql);
            db.run(createCartSql);
            db.run(createLikesSql);

            // Safely migrate orders table columns if they do not exist yet
            db.run("ALTER TABLE orders ADD COLUMN courier_name TEXT DEFAULT 'BlueDart Express'", () => {});
            db.run("ALTER TABLE orders ADD COLUMN tracking_awb TEXT DEFAULT 'AWB-98421074'", () => {});

            console.log('✅ Items, Orders, Users, Cart, and Likes tables ready.');
            resolve();
        });
    });
};

// Promisified Database Helpers
const dbAsync = {
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
};

module.exports = {
    db,
    initDb,
    dbAsync
};
