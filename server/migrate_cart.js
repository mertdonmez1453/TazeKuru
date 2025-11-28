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

    updateCartTable();
});

function updateCartTable() {
    console.log("Updating cart table schema...");

    // Drop existing cart table and recreate it to hold items
    // Or better, rename it to cart_items if we want to follow standard, but let's stick to 'cart' as the table name for items for simplicity in this context
    // New schema: cart_id (PK), buyer_id, product_id, quantity

    const dropSql = "DROP TABLE IF EXISTS cart";
    const createSql = `
    CREATE TABLE cart (
        cart_id INT AUTO_INCREMENT PRIMARY KEY,
        buyer_id INT,
        product_id INT,
        quantity INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(user_id),
        FOREIGN KEY (product_id) REFERENCES product(product_id)
    )
  `;

    db.query(dropSql, (err) => {
        if (err) console.error("Error dropping cart:", err);

        db.query(createSql, (err) => {
            if (err) {
                console.error("Error creating cart table:", err);
            } else {
                console.log("Cart table updated successfully.");
            }
            db.end();
        });
    });
}
