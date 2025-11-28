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

    const queries = [
        "SELECT count(*) as count FROM users",
        "SELECT count(*) as count FROM user",
        "SHOW CREATE TABLE product",
        "SHOW CREATE TABLE address"
    ];

    let pending = queries.length;

    queries.forEach(q => {
        db.query(q, (err, res) => {
            console.log(`\nQuery: ${q}`);
            if (err) console.log("Error:", err.message);
            else {
                if (res[0]['Create Table']) console.log(res[0]['Create Table']);
                else console.log(res);
            }
            pending--;
            if (pending === 0) db.end();
        });
    });
});
