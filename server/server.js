const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MySQL Bağlantısı -----------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "qqqqqqq",
  database: process.env.DB_NAME || "tazekuru_db",
  port: process.env.DB_PORT || 3006
});

db.connect((err) => {
  if (err) {
    console.log("MySQL bağlantı hatası:", err.message);
  } else {
    console.log("MySQL'e başarıyla bağlandı!");
  }
});

db.on("error", (err) => {
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("MySQL bağlantısı kesildi. Yeniden bağlanılıyor...");
    db.connect();
  } else {
    throw err;
  }
});

// ----------------- API ENDPOINTLER -----------------

app.get("/api/yemekler", (req, res) => {
  const sql = `
    SELECT p.*, u.first_name, u.last_name, u.rating
    FROM product p
    LEFT JOIN users u ON p.seller_id = u.user_id
    ORDER BY p.upload_date DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

app.get("/api/product/:id", (req, res) => {
  const pid = req.params.id;

  const sql = `
    SELECT p.*, u.first_name, u.last_name, u.user_id AS seller_id
    FROM product p
    JOIN users u ON p.seller_id = u.user_id
    WHERE product_id = ?
  `;

  db.query(sql, [pid], (err, data) => {
    if (err) return res.status(500).json({ error:"SQL Hatası",details:err });
    if (!data.length) return res.status(404).json({ error:"Ürün bulunamadı" });

    res.json({
      product: data[0],
      seller: {
        first_name: data[0].first_name,
        last_name: data[0].last_name,
        seller_id: data[0].seller_id
      }
    });
  });
});

app.get("/api/reviews/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    "SELECT * FROM review WHERE product_id = ? ORDER BY review_date DESC",
    [productId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
});



// satıcı detay + ürünleri
app.get("/api/seller/:id", (req, res) => {
    const sellerId = req.params.id;

    const sellerQuery = "SELECT user_id, first_name, last_name, email, rating FROM users WHERE user_id=?";
    const productQuery = "SELECT * FROM product WHERE seller_id=?";

    db.query(sellerQuery, [sellerId], (err, seller) => {
        if (err) return res.status(500).json({ error: err });

        db.query(productQuery, [sellerId], (err, products) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                seller: seller[0],
                products: products
            });
        });
    });
});


app.post("/api/signup", (req, res) => {
  const {
    username,
    password,
    first_name,
    last_name,
    phone_number,
    email,
    registration_date,
    rating,
    loyalty_points
  } = req.body;

  if (!username || !password || !email)
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });

  const sql = `
    INSERT INTO users 
    (username, password, first_name, last_name, phone_number, email, registration_date, rating, loyalty_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [username, password, first_name, last_name, phone_number, email, registration_date, rating, loyalty_points], (err) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası.", details: err });
    return res.json({ message: "Kullanıcı başarıyla kayıt edildi." });
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    if (data.length > 0) {
      return res.json({ message: "Giriş başarılı", user: data[0] });
    } else {
      return res.status(401).json({ message: "username veya şifre hatalı" });
    }
  });
});

app.post("/api/order", (req, res) => {
  const { buyer_id, seller_id, product_id, price } = req.body;

  if (!buyer_id || !seller_id || !product_id)
    return res.status(400).json({ error: "Eksik veri gönderildi" });

  const insertOrder = `
    INSERT INTO orders (buyer_id, seller_id, order_date, total_price, status)
    VALUES (?, ?, CURDATE(), ?, 'pending')
  `;

  db.query(insertOrder, [buyer_id, seller_id, price], (err, result) => {
    if (err) return res.status(500).json({ error: "Sipariş oluşturulamadı", details: err });

    const orderId = result.insertId;

    const insertItem = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, 1, ?)
    `;

    db.query(insertItem, [orderId, product_id, price], () => {
      res.json({ message: "Sipariş başarıyla oluşturuldu!", order_id: orderId });
    });
  });
});

app.get("/api/orders/:buyer_id", (req, res) => {
  const buyer_id = req.params.buyer_id;

  const sql = `
    SELECT 
      o.order_id, o.order_date, o.total_price, o.status,
      oi.quantity, oi.price AS item_price,
      p.name AS product_name, p.photo AS product_photo
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN product p ON oi.product_id = p.product_id
    WHERE o.buyer_id = ?
    ORDER BY o.order_id DESC
  `;

  db.query(sql, [buyer_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    let orders = [];

    result.forEach(row => {
      let existing = orders.find(o => o.order_id === row.order_id);

      if (!existing) {
        orders.push({
          order_id: row.order_id,
          order_date: row.order_date,
          total_price: row.total_price,
          status: row.status,
          items: []
        });

        existing = orders[orders.length - 1];
      }

      if (row.product_name) {
        existing.items.push({
          name: row.product_name,
          quantity: row.quantity,
          price: row.item_price,
          photo: row.product_photo
        });
      }
    });

    res.json({ orders });
  });
});



app.get("/api/get-current-user", (req, res) => {
  const userId = req.headers["user-id"];

  const sql = `
    SELECT user_id, username, email, first_name, last_name, phone_number, rating, loyalty_points
    FROM users WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    return res.json({ user: data[0] });
  });
});

//------------------------------------------------------------------
// 2) UPDATE USER  (PROFİL GÜNCELLEME)
//------------------------------------------------------------------
app.put("/api/update-user", (req, res) => {
  const { user_id, first_name, last_name, phone_number, email } = req.body;

  const sql = `
      UPDATE users SET
      first_name = ?, last_name = ?, phone_number = ?, email = ?
      WHERE user_id = ?
  `;

  db.query(sql, [first_name, last_name, phone_number, email, user_id], err => {
    if (err) return res.status(500).json(err);

    const fetchSql = `SELECT user_id, username, email, first_name, last_name, phone_number, rating, loyalty_points FROM users WHERE user_id=?`;

    db.query(fetchSql, [user_id], (err2, data) => {
      if (err2) return res.status(500).json(err2);

      res.json({
        message: "Profil başarıyla güncellendi ✔",
        user: data[0]
      });
    });
  });
});


// 🔥 YEMEK EKLEME — /api/add-product
app.post("/api/add-product", (req, res) => {
  const { seller_id, name, description, price, quantity, photo, upload_date, is_available } = req.body;

  const sql = `
    INSERT INTO product (seller_id, name, description, price, quantity, photo, upload_date, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [seller_id, name, description, price, quantity, photo, upload_date, is_available], (err, result) => {
    if (err) {
      console.log("DB INSERT ERR:", err);
      return res.status(500).json({ error: "Veritabanına eklenemedi", details: err });
    }

    res.json({ message: "Yemek başarıyla eklendi!" });
  });
});


app.post("/api/save-address", (req, res) => {
  const { user_id, lat, lng, address } = req.body;

      const insertSql = "INSERT INTO coordinate (user_id, lat, lng, address) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [user_id, lat, lng, address], (err3) => {
        if (err3) {
          console.log("INSERT ERROR:", err3);
          return res.status(500).json({ error: "DB hatası", details: err3 });
        }
        return res.json({ message: "Adres kaydedildi." });
      });
});

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
