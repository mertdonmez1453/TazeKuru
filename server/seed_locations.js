const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "tazekuru_db",
    port: process.env.DB_PORT || 3306
});

// Mock locations in Istanbul (approximate)
const locations = [
    { name: "Kadikoy", lat: 40.9901, lon: 29.0292 },
    { name: "Besiktas", lat: 41.0422, lon: 29.0067 },
    { name: "Uskudar", lat: 41.0260, lon: 29.0156 },
    { name: "Sisli", lat: 41.0529, lon: 28.9877 },
    { name: "Maltepe", lat: 40.9248, lon: 29.1307 },
    { name: "Fatih", lat: 41.0082, lon: 28.9784 }
];

db.connect(async (err) => {
    if (err) {
        console.error("MySQL connection error:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL!");

    try {
        // Get all sellers
        const sellers = await query("SELECT user_id FROM users WHERE role = 'seller'");

        for (let i = 0; i < sellers.length; i++) {
            const seller = sellers[i];
            const loc = locations[i % locations.length]; // Cycle through mock locations

            // Check if seller already has an address
            const existing = await query("SELECT address_id FROM address WHERE user_id = ?", [seller.user_id]);

            if (existing.length === 0) {
                // Add new address
                const newId = (await getMaxId()) + 1;
                const sql = `
                    INSERT INTO address (address_id, user_id, city, street, neighbourhood, description, latitude, longitude)
                    VALUES (?, ?, 'Istanbul', ?, ?, ?, ?, ?)
                `;
                await query(sql, [
                    newId,
                    seller.user_id,
                    loc.name + " Caddesi",
                    loc.name + " Mahallesi",
                    "Merkez Şube",
                    loc.lat,
                    loc.lon
                ]);
                console.log(`Added address for seller ${seller.user_id} at ${loc.name}`);
            } else {
                // Update existing address
                const sql = "UPDATE address SET latitude = ?, longitude = ? WHERE user_id = ?";
                await query(sql, [loc.lat, loc.lon, seller.user_id]);
                console.log(`Updated address for seller ${seller.user_id} at ${loc.name}`);
            }
        }
        console.log("Seeding locations completed.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function getMaxId() {
    return new Promise((resolve, reject) => {
        db.query("SELECT MAX(address_id) as maxId FROM address", (err, result) => {
            if (err) reject(err);
            else resolve(result[0].maxId || 0);
        });
    });
}
