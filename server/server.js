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
  const { id } = req.params;

  db.query(
    "SELECT * FROM product WHERE product_id = ?",
    [id],
    (err, product) => {
      if (err) return res.status(500).json({ error: "Veritabanı hatası", details: err });
      if (!product.length) return res.status(404).json({ error: "Ürün bulunamadı" });

      db.query(
        "SELECT first_name, last_name FROM users WHERE user_id = ?",
        [product[0].seller_id],
        (err2, seller) => {
          if (err2) return res.json({ product: product[0], seller: null });
          
          res.json({ product: product[0], seller: seller[0] });
        }
      );
    }
  );
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
