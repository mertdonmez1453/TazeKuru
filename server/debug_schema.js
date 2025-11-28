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

    db.query("SHOW TABLES", (err, tables) => {
        if (err) console.error(err);
        else {
            console.log("Tables found:");
            tables.forEach(t => console.log(Object.values(t)[0]));

            // Check constraints for product and address
            checkConstraints();
        }
    });
});

function checkConstraints() {
    const tables = ['product', 'address'];
    let pending = tables.length;

    tables.forEach(table => {
        db.query(`SHOW CREATE TABLE ${table}`, (err, result) => {
            if (!err) {
                console.log(`\n--- ${table} Schema ---`);
                console.log(result[0]['Create Table']);
            }
            pending--;
            if (pending === 0) db.end();
        });
    });
}
