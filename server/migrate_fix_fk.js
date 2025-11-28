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

    fixForeignKeys();
});

async function fixForeignKeys() {
    try {
        // 1. Get constraint names
        const [productConstraints] = await db.promise().query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'product' AND REFERENCED_TABLE_NAME = 'user' AND TABLE_SCHEMA = 'tazekuru_db'
    `);

        const [addressConstraints] = await db.promise().query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'address' AND REFERENCED_TABLE_NAME = 'user' AND TABLE_SCHEMA = 'tazekuru_db'
    `);

        // 2. Drop and Recreate for Product
        if (productConstraints.length > 0) {
            const fkName = productConstraints[0].CONSTRAINT_NAME;
            console.log(`Dropping FK ${fkName} from product...`);
            await db.promise().query(`ALTER TABLE product DROP FOREIGN KEY ${fkName}`);
            console.log("Adding new FK to product referencing users...");
            await db.promise().query(`
        ALTER TABLE product 
        ADD CONSTRAINT fk_product_seller 
        FOREIGN KEY (seller_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
        } else {
            console.log("No incorrect FK found on product referencing 'user'. Checking if it references 'users'...");
            // Optional: Check if it already references users
        }

        // 3. Drop and Recreate for Address
        if (addressConstraints.length > 0) {
            const fkName = addressConstraints[0].CONSTRAINT_NAME;
            console.log(`Dropping FK ${fkName} from address...`);
            await db.promise().query(`ALTER TABLE address DROP FOREIGN KEY ${fkName}`);
            console.log("Adding new FK to address referencing users...");
            await db.promise().query(`
        ALTER TABLE address 
        ADD CONSTRAINT fk_address_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
        } else {
            console.log("No incorrect FK found on address referencing 'user'.");
        }

        console.log("Foreign keys fixed.");
        process.exit(0);

    } catch (err) {
        console.error("Error fixing FKs:", err);
        process.exit(1);
    }
}
