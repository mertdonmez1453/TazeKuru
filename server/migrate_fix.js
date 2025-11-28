const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "tazekuru_db",
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
    console.log("Connected to database.");

    checkRoleColumn();
});

function checkRoleColumn() {
    db.query("SHOW COLUMNS FROM users LIKE 'role'", (err, results) => {
        if (err) {
            console.error("Error checking role column:", err);
            return checkSellerApprovedColumn();
        }

        if (results.length === 0) {
            console.log("Adding 'role' column...");
            db.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer'", (err) => {
                if (err) console.error("Error adding role column:", err);
                else console.log("Role column added.");
                checkSellerApprovedColumn();
            });
        } else {
            console.log("'role' column already exists.");
            checkSellerApprovedColumn();
        }
    });
}

function checkSellerApprovedColumn() {
    db.query("SHOW COLUMNS FROM users LIKE 'is_seller_approved'", (err, results) => {
        if (err) {
            console.error("Error checking is_seller_approved column:", err);
            return checkMessagesTable();
        }

        if (results.length === 0) {
            console.log("Adding 'is_seller_approved' column...");
            db.query("ALTER TABLE users ADD COLUMN is_seller_approved BOOLEAN DEFAULT FALSE", (err) => {
                if (err) console.error("Error adding is_seller_approved column:", err);
                else console.log("is_seller_approved column added.");
                checkMessagesTable();
            });
        } else {
            console.log("'is_seller_approved' column already exists.");
            checkMessagesTable();
        }
    });
}

function checkMessagesTable() {
    const createMessagesSql = `
    CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT,
        receiver_id INT,
        product_id INT,
        message_text TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sender_id) REFERENCES users(user_id),
        FOREIGN KEY (receiver_id) REFERENCES users(user_id),
        FOREIGN KEY (product_id) REFERENCES product(product_id)
    );
  `;
    db.query(createMessagesSql, (err) => {
        if (err) console.error("Error creating messages table:", err);
        else console.log("Messages table checked/created.");
        db.end();
    });
}
