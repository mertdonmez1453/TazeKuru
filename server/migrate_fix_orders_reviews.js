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
    console.log("Connected.");

    fixDatabase();
});

async function fixDatabase() {
    try {
        // 1. Fix Review Foreign Keys
        const [reviewConstraints] = await db.promise().query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'review' AND REFERENCED_TABLE_NAME = 'user' AND TABLE_SCHEMA = 'tazekuru_db'
    `);

        if (reviewConstraints.length > 0) {
            const fkName = reviewConstraints[0].CONSTRAINT_NAME;
            console.log(`Dropping FK ${fkName} from review...`);
            await db.promise().query(`ALTER TABLE review DROP FOREIGN KEY ${fkName}`);
            console.log("Adding new FK to review referencing users...");
            await db.promise().query(`
        ALTER TABLE review 
        ADD CONSTRAINT fk_review_buyer 
        FOREIGN KEY (buyer_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
        }

        // 2. Create or Fix Orders Table
        // Check if 'orders' or 'order' exists
        const [tables] = await db.promise().query("SHOW TABLES LIKE 'orders'");

        if (tables.length === 0) {
            console.log("Table 'orders' does not exist. Checking for 'order'...");
            const [tablesOrder] = await db.promise().query("SHOW TABLES LIKE 'order'");

            if (tablesOrder.length > 0) {
                console.log("Table 'order' found. Renaming to 'orders'...");
                await db.promise().query("RENAME TABLE `order` TO orders");
            } else {
                console.log("Creating 'orders' table...");
                await db.promise().query(`
          CREATE TABLE orders (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            buyer_id INT,
            seller_id INT,
            address_id INT,
            total_price DECIMAL(10,2),
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20) DEFAULT 'Pending',
            FOREIGN KEY (buyer_id) REFERENCES users(user_id),
            FOREIGN KEY (seller_id) REFERENCES users(user_id),
            FOREIGN KEY (address_id) REFERENCES address(address_id)
          )
        `);
            }
        }

        // Ensure 'orders' has correct FKs
        // We'll just try to add them if they don't exist, or recreate the table if it's too messy.
        // For now, let's assume if we renamed or created it, it's fine. 
        // If it existed, we might need to check its FKs.

        console.log("Database fixed.");
        process.exit(0);

    } catch (err) {
        console.error("Error fixing database:", err);
        process.exit(1);
    }
}
