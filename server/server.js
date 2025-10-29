const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL bağlantısı
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // kendi kullanıcı adını yaz
  password: "qqqqqqq",       // şifren varsa yaz
  database: "tazekuru_db",
  port: 3006
});

// Test bağlantısı
db.connect((err) => {
  if (err) {
    console.log("MySQL bağlantı hatası:", err);
  } else {
    console.log("MySQL'e başarıyla bağlandı!");
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
  const { ad, email, sifre } = req.body;

  if (!ad || !email || !sifre) {
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

  const sql = "INSERT INTO users (ad, email, sifre) VALUES (?, ?, ?)";
  db.query(sql, [ad, email, sifre], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ message: "Kullanıcı başarıyla kayıt edildi." });
  });
});

// KULLANICI GİRİŞ (LOGIN)
app.post("/api/login", (req, res) => {
  const { email, sifre } = req.body;

  if (!email || !sifre) {
    return res.status(400).json({ error: "Eksik bilgi gönderildi." });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND sifre = ?";
  db.query(sql, [email, sifre], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    if (data.length > 0) {
      return res.json({ message: "Giriş başarılı", user: data[0] });
    } else {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }
  });
});
