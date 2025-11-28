const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tazekuru_db'
});

const mockProducts = [
    {
        product_id: 2,
        name: "Ev Yapımı Mantı",
        description: "Anne elinden ince açılmış, özenle hazırlanmış geleneksel mantı. Yoğurt ve tereyağı soslu.",
        price: 85,
        quantity: 12,
        photo: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800",
        seller_id: 1,
        category_id: 1,
        tags: "Ev Yapımı,Geleneksel",
        views: 245,
        sales: 34,
        featured: 1,
        is_available: 1
    },
    {
        product_id: 2,
        name: "Sıcak Mercimek Çorbası",
        description: "Taze sebzelerle hazırlanan sağlıklı ve doyurucu mercimek çorbası. Limon ile servis edilir.",
        price: 25,
        quantity: 20,
        photo: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
        seller_id: 2,
        category_id: 5,
        tags: "Sıcak,Vegan,Organik",
        views: 189,
        sales: 56,
        featured: 0,
        is_available: 1
    },
    {
        product_id: 4,
        name: "Baklava (1 kg)",
        description: "Antep fıstıklı, kat kat açılmış yufka ile hazırlanmış geleneksel baklava.",
        price: 220,
        quantity: 8,
        photo: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800",
        seller_id: 3,
        category_id: 3,
        tags: "Geleneksel,Taze",
        views: 312,
        sales: 28,
        featured: 1,
        is_available: 1
    },
    {
        product_id: 5,
        name: "Taze Sezar Salata",
        description: "Çıtır marul, parmesan peyniri, kruton ve özel sezar sosu ile hazırlanmış taze salata.",
        price: 45,
        quantity: 15,
        photo: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800",
        seller_id: 4,
        category_id: 4,
        tags: "Taze,Soğuk",
        views: 167,
        sales: 42,
        featured: 0,
        is_available: 1
    },
    {
        product_id: 6,
        name: "Ev Böreği (Tepsi)",
        description: "Su böreği tadında, el açması yufka ile hazırlanmış peynirli tepsi böreği.",
        price: 120,
        quantity: 6,
        photo: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
        seller_id: 1,
        category_id: 2,
        tags: "Ev Yapımı,Sıcak",
        views: 298,
        sales: 38,
        featured: 1,
        is_available: 1
    },
    {
        product_id: 7,
        name: "Menemen (2 Porsiyon)",
        description: "Taze domatesler, biber ve yumurta ile geleneksel menemen. Sıcak servis edilir.",
        price: 35,
        quantity: 18,
        photo: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800",
        seller_id: 2,
        category_id: 6,
        tags: "Sıcak,Kahvaltılık",
        views: 156,
        sales: 51,
        featured: 0,
        is_available: 1
    },
    {
        product_id: 8,
        name: "Vegan Buddha Bowl",
        description: "Kinoa, nohut, avokado, taze sebzeler ve tahini sosu ile hazırlanmış sağlıklı bowl.",
        price: 55,
        quantity: 10,
        photo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        seller_id: 4,
        category_id: 4,
        tags: "Vegan,Organik,Taze",
        views: 203,
        sales: 29,
        featured: 0,
        is_available: 1
    },
    {
        product_id: 9,
        name: "Künefe (Porsiyon)",
        description: "Hatay usulü, taze kadayıf ile hazırlanmış özel künefe. Sıcak servis edilir.",
        price: 65,
        quantity: 14,
        photo: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
        seller_id: 3,
        category_id: 3,
        tags: "Geleneksel,Sıcak",
        views: 287,
        sales: 47,
        featured: 1,
        is_available: 1
    }
];

console.log('🔄 Seeding database with mock products...');

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }

    console.log('✅ Connected to database');

    let inserted = 0;
    const total = mockProducts.length;

    mockProducts.forEach((product, index) => {
        const sql = `
      INSERT INTO product (product_id, seller_id, name, description, price, upload_date, photo, quantity, is_available, category_id, tags, views, sales, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
    `;

        const values = [
            product.product_id,
            product.name,
            product.description,
            product.price,
            product.quantity,
            product.photo,
            product.seller_id,
            product.category_id,
            product.tags,
            product.views,
            product.sales,
            product.featured,
            product.is_available
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(`❌ Failed to insert product ${index + 1}:`, err.message);
            } else {
                console.log(`✅ Inserted: ${product.name} (ID: ${result.insertId})`);
            }

            inserted++;
            if (inserted === total) {
                console.log(`\n✅ Successfully seeded ${total} products!`);
                db.end();
            }
        });
    });
});
