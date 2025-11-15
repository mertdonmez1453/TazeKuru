const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL bağlantısı
// Port numarasını environment variable'dan al, yoksa varsayılan olarak 3306 kullan
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",       // kendi kullanıcı adını yaz
  password: process.env.DB_PASSWORD || "root",       // şifren varsa yaz
  database: process.env.DB_NAME || "tazekuru_db",
  port: process.env.DB_PORT || 3306  // MySQL varsayılan portu (3006 yerine 3306)
});

// Test bağlantısı
db.connect((err) => {
  if (err) {
    console.log("MySQL bağlantı hatası:", err.message);
    console.log("Lütfen MySQL'in çalıştığından ve port ayarlarının doğru olduğundan emin olun.");
    console.log("Eğer MySQL farklı bir portta çalışıyorsa, server.js dosyasındaki port numarasını güncelleyin.");
  } else {
    console.log("MySQL'e başarıyla bağlandı!");
  }
});

// Bağlantı hatası durumunda yeniden bağlanmayı dene
db.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('MySQL bağlantısı kesildi. Yeniden bağlanılıyor...');
    db.connect();
  } else {
    throw err;
  }
});

// Basit örnek endpoint
app.get("/api/yemekler", (req, res) => {
  const sql = "SELECT * FROM yemekler";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("Server 8081 portunda çalışıyor...");
});

// KULLANICI KAYIT (SIGNUP)
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

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

  const sql = `
    INSERT INTO users 
    (username, password, first_name, last_name, phone_number, email, registration_date, rating, loyalty_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [username, password, first_name, last_name, phone_number, email, registration_date, rating, loyalty_points],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Veritabanı hatası." });
      }
      return res.json({ message: "Kullanıcı başarıyla kayıt edildi." });
    }
  );
});


// KULLANICI GİRİŞ (LOGIN)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

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
