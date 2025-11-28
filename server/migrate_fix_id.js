const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "tazekuru_db",
    port: process.env.DB_PORT || 3306,
    multipleStatements: true // Enable multiple statements for SET FOREIGN_KEY_CHECKS
});

db.connect((err) => {
    if (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
    console.log("Connected to database.");

    fixUserId();
});

function fixUserId() {
    console.log("Modifying user_id to be AUTO_INCREMENT (disabling FK checks)...");

    const sql = `
    SET FOREIGN_KEY_CHECKS = 0;
    ALTER TABLE users MODIFY COLUMN user_id INT AUTO_INCREMENT;
    SET FOREIGN_KEY_CHECKS = 1;
  `;

    db.query(sql, (err) => {
        if (err) {
            console.error("Error modifying user_id:", err);
        } else {
            console.log("user_id is now AUTO_INCREMENT.");
        }
        db.end();
    });
}
