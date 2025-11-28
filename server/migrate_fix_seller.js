const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "tazekuru_db",
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
    console.log("Connected to database.");

    approveSellers();
});

function approveSellers() {
    console.log("Approving all sellers and updating default...");

    const sql = `
    UPDATE users SET is_seller_approved = TRUE WHERE role = 'seller';
    ALTER TABLE users MODIFY COLUMN is_seller_approved BOOLEAN DEFAULT TRUE;
  `;

    db.query(sql, (err) => {
        if (err) {
            console.error("Error approving sellers:", err);
        } else {
            console.log("All sellers approved and default set to TRUE.");
        }
        db.end();
    });
}
