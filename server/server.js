const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL bağlantısı
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "tazekuru_db",
  port: process.env.DB_PORT || 3306
});

// Bağlantı yönetimi
function handleDisconnect() {
  db.connect((err) => {
    if (err) {
      console.log("MySQL bağlantı hatası:", err.message);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("MySQL'e başarıyla bağlandı!");
    }
  });

  db.on('error', (err) => {
    console.log('MySQL hatası:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// --- AUTH ENDPOINTS ---

// Kayıt Ol
app.post("/api/auth/signup", (req, res) => {
  const { email, password, first_name, last_name, phone_number, role } = req.body;

  // Basit validasyon
  if (!email || !password) {
    return res.status(400).json({ error: "Email ve şifre zorunludur." });
  }

  const username = email.split('@')[0]; // Username'i email'den türet
  const registration_date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const userRole = role === 'seller' ? 'seller' : 'customer';

  const sql = `
    INSERT INTO users 
    (username, password, first_name, last_name, phone_number, email, registration_date, rating, loyalty_points, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
  `;

  db.query(sql, [username, password, first_name, last_name, phone_number, email, registration_date, userRole], (err, result) => {
    if (err) {
      console.error("Signup Error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Bu email veya kullanıcı adı zaten kayıtlı." });
      }
      return res.status(500).json({ error: "Kayıt olurken bir hata oluştu." });
    }

    // Kayıt başarılı, kullanıcı bilgisini döndür
    const userId = result.insertId;
    const user = {
      user_id: userId,
      email,
      username,
      first_name,
      last_name,
      role: userRole
    };

    res.status(201).json({ message: "Kayıt başarılı", user });
    // 🔥 Eğer seller ise başvuru oluştur
    if (role === "seller") {
      db.query(
        "INSERT INTO seller_applications (user_id, is_seller_approved) VALUES (?, 0)",
        [userId],
        (err2) => {
          if (err2) {
            console.error("Satıcı başvurusu oluşturulamadı:", err2);
            // Hata olsa bile kullanıcı oluşturuldu, devam et
          }
        }
      );
    }

    res.json({
      success: true,
      message: "Kayıt başarılı",
      user_id: userId
    });
  });
});

// Giriş Yap
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, data) => {
    if (err) return res.status(500).json({ error: "Giriş hatası." });

    if (data.length > 0) {
      const user = data[0];
      // Güvenlik için şifreyi response'dan çıkar
      delete user.password;

      // Role kontrolü
      user.role = user.role || 'customer';

      res.json({ message: "Giriş başarılı", user });
    } else {
      res.status(401).json({ error: "Email veya şifre hatalı." });
    }
  });
});

// --- PRODUCT ENDPOINTS ---

// Tüm Ürünleri Getir (Filtreleme ile)
// Backend - server.js içindeki /api/products endpoint'ini değiştir

app.get("/api/products", (req, res) => {
  const { seller_id, user_lat, user_lon, tag } = req.query;

  // Konum parametrelerini kontrol et
  const hasLocation = user_lat && user_lon && user_lat != 0 && user_lon != 0;

  let sql = `
    SELECT 
      p.*,
      u.first_name,
      u.last_name,
      u.rating as seller_rating,
      MAX(a.latitude) as latitude,
      MAX(a.longitude) as longitude,
      GROUP_CONCAT(DISTINCT t.tag_name) AS tags
      ${hasLocation ? `, 
      (
        6371 * acos(
          cos(radians(?)) * cos(radians(COALESCE(MAX(a.latitude), 0))) *
          cos(radians(COALESCE(MAX(a.longitude), 0)) - radians(?)) +
          sin(radians(?)) * sin(radians(COALESCE(MAX(a.latitude), 0)))
        )
      ) AS distance` : ''}
    FROM product p
    JOIN users u ON p.seller_id = u.user_id
    LEFT JOIN address a ON u.user_id = a.user_id
    LEFT JOIN product_tags pt ON pt.product_id = p.product_id
    LEFT JOIN tags t ON t.tag_id = pt.tag_id
    WHERE p.is_available = 1
  `;

  const params = [];

  // Konum parametrelerini sadece gerektiğinde ekle
  if (hasLocation) {
    params.push(user_lat, user_lon, user_lat);
  }

  // Tag filtresi - TÜM seçilen taglere sahip olmalı
  if (tag) {
    const tags = tag.split(",").map(t => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      const placeholders = tags.map(() => "?").join(",");

      // 🔥 DÜZELTME: Seçilen TÜM taglere sahip ürünler
      sql += `
        AND (
          SELECT COUNT(DISTINCT t2.tag_name)
          FROM product_tags pt2
          JOIN tags t2 ON pt2.tag_id = t2.tag_id
          WHERE pt2.product_id = p.product_id 
          AND t2.tag_name IN (${placeholders})
        ) = ?
      `;
      params.push(...tags, tags.length);
    }
  }

  // Satıcı filtresi
  if (seller_id) {
    sql += " AND p.seller_id = ?";
    params.push(seller_id);
  }

  sql += " GROUP BY p.product_id";

  // Mesafe filtresi sadece konum verildiğinde
  if (hasLocation) {
    sql += " HAVING distance <= 7";
  }

  sql += " ORDER BY p.upload_date DESC";

  console.log("🔍 SQL Query:", sql);
  console.log("🔍 Parameters:", params);

  db.query(sql, params, (err, data) => {
    if (err) {
      console.error("❌ Products SQL Error:", err);
      console.error("❌ SQL:", sql);
      console.error("❌ Params:", params);
      return res.status(500).json({ error: "Ürünler getirilemedi", details: err.message });
    }

    console.log(`✅ ${data.length} ürün bulundu`);

    const formatted = data.map(p => ({
      ...p,
      tags: p.tags ? p.tags.split(",") : [],
      users: {
        first_name: p.first_name,
        last_name: p.last_name,
        rating: p.seller_rating
      }
    }));

    res.json(formatted);
  });
});


// Tek Ürün Getir
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const sql = "SELECT * FROM product WHERE product_id = ?";

  db.query(sql, [productId], (err, data) => {
    if (err) return res.status(500).json({ error: "Ürün getirilemedi." });
    if (data.length === 0) return res.status(404).json({ error: "Ürün bulunamadı." });

    res.json(data[0]);
  });
});

// Yeni Ürün Ekle
app.post("/api/products", (req, res) => {
  const { seller_id, name, description, price, photo, quantity } = req.body;

  const getMaxIdSql = "SELECT MAX(product_id) as maxId FROM product";
  db.query(getMaxIdSql, (err, result) => {
    if (err) return res.status(500).json({ error: "ID oluşturma hatası" });

    const newId = (result[0].maxId || 0) + 1;
    const upload_date = new Date().toISOString().slice(0, 10);

    const insertSql = `
      INSERT INTO product (product_id, seller_id, name, description, price, upload_date, photo, quantity, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.query(insertSql, [newId, seller_id, name, description, price, upload_date, photo, quantity], (err, result) => {
      if (err) {
        console.error("Add Product Error:", err);
        return res.status(500).json({ error: "Ürün eklenemedi." });
      }
      res.status(201).json({ message: "Ürün başarıyla eklendi.", product_id: newId });
    });
  });
});

// --- SELLER ENDPOINTS ---

// Satıcıları Getir
app.get("/api/sellers", (req, res) => {
  const sql = "SELECT user_id, username, first_name, last_name, rating FROM users WHERE role = 'seller' ORDER BY rating DESC LIMIT 10";

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: "Satıcılar getirilemedi." });
    res.json(data);
  });
});

// Tek Satıcı Getir
app.get("/api/sellers/:id", (req, res) => {
  const sql = "SELECT user_id, username, first_name, last_name, rating, email, phone_number FROM users WHERE user_id = ?";
  db.query(sql, [req.params.id], (err, data) => {
    if (err) return res.status(500).json({ error: "Satıcı getirilemedi." });
    if (data.length === 0) return res.status(404).json({ error: "Satıcı bulunamadı." });
    res.json(data[0]);
  });
});

// --- ORDER ENDPOINTS ---
// Satıcının Siparişleri
app.get("/api/orders/seller-orders", (req, res) => {
  const sellerId = req.query.seller_id;
  if (!sellerId) return res.status(400).json({ error: "Seller ID gerekli" });

  const sql = `
    SELECT 
      o.*,
      u.first_name AS buyer_name,
      u.last_name AS buyer_lastname
    FROM orders o
    JOIN users u ON o.buyer_id = u.user_id
    WHERE o.seller_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(sql, [sellerId], (err, data) => {
    if (err) {
      console.error("Satıcı siparişleri hata:", err);
      return res.status(500).json({ error: "Satıcı siparişleri getirilemedi." });
    }
    res.json(data);
  });
});
// Sipariş Durumu Güncelle (Satıcı: hazırlanıyor / teslim edildi)
app.put("/api/orders/:id/status", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = ["preparing", "delivered"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Geçersiz sipariş durumu" });
  }

  // Önce siparişi alalım ki müşteri id'sini öğrenelim
  const getOrderSql = "SELECT * FROM orders WHERE order_id = ?";

  db.query(getOrderSql, [orderId], (err, result) => {
    if (err) {
      console.error("Order fetch error:", err);
      return res.status(500).json({ error: "Sipariş bilgisi alınamadı." });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Sipariş bulunamadı." });
    }

    const order = result[0];

    const updateSql = "UPDATE orders SET status = ? WHERE order_id = ?";
    db.query(updateSql, [status, orderId], (err2, updateRes) => {
      if (err2) {
        console.error("Status update error:", err2);
        return res.status(500).json({ error: "Sipariş durumu güncellenemedi." });
      }

      // Müşteriye bildirim
      let notifMsg;
      if (status === "preparing") {
        notifMsg = `Siparişiniz hazırlanıyor! Sipariş ID: ${orderId}`;
      } else if (status === "delivered") {
        notifMsg = `Siparişiniz teslim edildi! Afiyet olsun 😋 Sipariş ID: ${orderId}`;
      }

      const notifSql = "INSERT INTO notifications (user_id, message) VALUES (?, ?)";
      db.query(notifSql, [order.buyer_id, notifMsg], (err3) => {
        if (err3) {
          console.error("Notification error:", err3);
          // Bildirim patlasa bile sipariş güncellemesi başarılı kabul edelim
        }

        res.json({
          message: "Sipariş durumu güncellendi.",
          status
        });
      });
    });
  });
});



// Sipariş Oluştur
app.post("/api/orders", (req, res) => {
  const { buyer_id, seller_id, total_price, items, address_id } = req.body; // items: [{product_id, quantity, price}]
  const product_id = items[0]?.product_id; // 🔥 Tek ürün siparişi
  if (!product_id) {
    return res.status(400).json({ error: "product_id bulunamadı" });
  }

  const getMaxIdSql = "SELECT MAX(order_id) as maxId FROM orders";

  db.query(getMaxIdSql, (err, result) => {
    if (err) return res.status(500).json({ error: "Sipariş ID hatası" });

    const orderId = (result[0].maxId || 0) + 1;
    const orderDate = new Date().toISOString().slice(0, 10);
    const status = "pending";

    const orderSql = `
      INSERT INTO orders (order_id, buyer_id, seller_id, address_id, order_date, total_price, status, product_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(orderSql, [orderId, buyer_id, seller_id, address_id, orderDate, total_price, status, product_id], (err, result) => {
      if (err) {
        console.error("Create Order Error:", err);
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        return res.status(500).json({ error: "Sipariş oluşturulamadı.", details: err.message });
      }

      // Ürün stoğunu düşür
      if (items && items.length > 0) {
        items.forEach(item => {
          const updateStockSql = "UPDATE product SET quantity = quantity - ? WHERE product_id = ?";
          db.query(updateStockSql, [item.quantity, item.product_id]);
        });
      }

      // Bildirim Oluştur (Satıcıya)
      const notifSql = "INSERT INTO notifications (user_id, message) VALUES (?, ?)";
      const notifMsg = `Yeni bir siparişiniz var! Sipariş ID: ${orderId}, Tutar: ${total_price} ₺`;
      db.query(notifSql, [seller_id, notifMsg]);

      res.status(201).json({ message: "Sipariş alındı", order_id: orderId });
    });
  });
});

// Kullanıcının Siparişleri
app.get("/api/orders/my-orders", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "User ID gerekli" });

  const sql = `
    SELECT 
      o.*, 
      u.first_name as seller_name, 
      u.last_name as seller_lastname,
      p.photo,
      p.product_id
    FROM orders o
    JOIN users u ON o.seller_id = u.user_id
    JOIN product p ON p.product_id = o.product_id
    WHERE o.buyer_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Siparişler getirilemedi." });
    res.json(data);
  });
});

// Ödeme İşlemi - Sipariş Durumunu Güncelle
app.put("/api/orders/:id/pay", (req, res) => {
  const orderId = req.params.id;

  // Siparişi "preparing" (hazırlanıyor) durumuna çevir
  const sql = "UPDATE orders SET status = 'preparing' WHERE order_id = ?";

  db.query(sql, [orderId], (err, result) => {
    if (err) {
      console.error("Payment Error:", err);
      return res.status(500).json({ error: "Ödeme işlemi başarısız." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sipariş bulunamadı." });
    }

    // Güncellenmiş siparişi getir
    const getOrderSql = `
      SELECT o.*, u.first_name as seller_name, u.last_name as seller_lastname 
      FROM orders o
      JOIN users u ON o.seller_id = u.user_id
      WHERE o.order_id = ?
    `;

    db.query(getOrderSql, [orderId], (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Sipariş bilgisi alınamadı." });
      }

      res.json({
        message: "Ödeme başarılı! Siparişiniz hazırlanıyor.",
        order: data[0]
      });
    });
  });
});

// --- REVIEW ENDPOINTS ---

// Ürün Yorumları
app.get("/api/reviews/:productId", (req, res) => {
  const sql = `
    SELECT r.*, u.first_name, u.last_name, u.username 
    FROM review r
    JOIN users u ON r.buyer_id = u.user_id
    WHERE r.product_id = ?
    ORDER BY r.review_date DESC
  `;

  db.query(sql, [req.params.productId], (err, data) => {
    if (err) return res.status(500).json({ error: "Yorumlar getirilemedi." });

    // Frontend formatına uygun
    const formattedData = data.map(item => ({
      ...item,
      users: {
        first_name: item.first_name,
        last_name: item.last_name,
        username: item.username
      }
    }));

    res.json(formattedData);
  });
});

// Yorum Ekle
app.post("/api/reviews", (req, res) => {
  const { product_id, buyer_id, rating, comment } = req.body;

  const getMaxIdSql = "SELECT MAX(review_id) as maxId FROM review";
  db.query(getMaxIdSql, (err, result) => {
    if (err) return res.status(500).json({ error: "Review ID hatası" });

    const reviewId = (result[0].maxId || 0) + 1;
    const reviewDate = new Date().toISOString().slice(0, 10);

    const sql = `
      INSERT INTO review (review_id, product_id, buyer_id, rating, comment, review_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [reviewId, product_id, buyer_id, rating, comment, reviewDate], (err, result) => {
      if (err) return res.status(500).json({ error: "Yorum eklenemedi." });

      // 1. Satıcıyı bul
      const findSellerSql = "SELECT seller_id FROM product WHERE product_id = ?";
      db.query(findSellerSql, [product_id], (err, sellerData) => {
        if (!err && sellerData.length > 0) {
          const sellerId = sellerData[0].seller_id;

          // 2. Satıcının tüm ürünlerinin yorumlarının ortalamasını al
          const avgRatingSql = `
            SELECT AVG(r.rating) as avgRating
            FROM review r
            JOIN product p ON r.product_id = p.product_id
            WHERE p.seller_id = ?
          `;

          db.query(avgRatingSql, [sellerId], (err, avgResult) => {
            if (!err && avgResult.length > 0) {
              const newRating = avgResult[0].avgRating || 0;

              // 3. Satıcı puanını güncelle
              const updateSellerSql = "UPDATE users SET rating = ? WHERE user_id = ?";
              db.query(updateSellerSql, [newRating, sellerId]);
            }
          });

          // 4. Bildirim Oluştur (Satıcıya)
          const notifSql = "INSERT INTO notifications (user_id, message) VALUES (?, ?)";
          const notifMsg = `Ürününe yeni bir yorum yapıldı! Puan: ${rating}`;
          db.query(notifSql, [sellerId, notifMsg]);
        }
      });

      res.status(201).json({ message: "Yorum eklendi" });
    });
  });
});

// --- USER ENDPOINTS ---

// Kullanıcı Güncelle
app.put("/api/users/:id", (req, res) => {
  const { first_name, last_name, phone_number, role } = req.body;

  let sql = "UPDATE users SET first_name = ?, last_name = ?, phone_number = ?";
  const params = [first_name, last_name, phone_number];

  if (role) {
    sql += ", role = ?";
    params.push(role);
  }

  sql += " WHERE user_id = ?";
  params.push(req.params.id);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("User Update Error:", err);
      return res.status(500).json({ error: "Güncelleme hatası" });
    }
    res.json({ message: "Kullanıcı güncellendi" });
  });
});

// --- ADDRESS ENDPOINTS ---

// Adresleri Getir
app.get("/api/addresses", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "User ID gerekli" });

  const sql = "SELECT * FROM address WHERE user_id = ?";
  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Adresler getirilemedi." });
    res.json(data);
  });
});

// Adres Ekle
app.post("/api/addresses", (req, res) => {
  const { user_id, city, street, neighbourhood, description, latitude, longitude } = req.body;

  const getMaxIdSql = "SELECT MAX(address_id) as maxId FROM address";
  db.query(getMaxIdSql, (err, result) => {
    if (err) return res.status(500).json({ error: "ID oluşturma hatası" });

    const newId = (result[0].maxId || 0) + 1;

    const sql = `
      INSERT INTO address (address_id, user_id, city, street, neighbourhood, description, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [newId, user_id, city, street, neighbourhood, description, latitude, longitude], (err, result) => {
      if (err) return res.status(500).json({ error: "Adres eklenemedi." });
      res.status(201).json({ message: "Adres eklendi", address_id: newId });
    });
  });
});

// Adres Sil
app.delete("/api/addresses/:id", (req, res) => {
  const sql = "DELETE FROM address WHERE address_id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Adres silinemedi." });
    res.json({ message: "Adres silindi" });
  });
});

// --- CART ENDPOINTS ---

// Sepeti Getir
app.get("/api/cart", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "User ID gerekli" });

  const sql = `
    SELECT c.*, p.name, p.price, p.photo, p.seller_id, u.first_name as seller_name
    FROM cart c
    JOIN product p ON c.product_id = p.product_id
    JOIN users u ON p.seller_id = u.user_id
    WHERE c.buyer_id = ?
  `;

  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Sepet getirilemedi." });
    res.json(data);
  });
});

// Sepete Ekle
app.post("/api/cart", (req, res) => {
  const { buyer_id, product_id, quantity } = req.body;

  // Önce ürün sepette var mı kontrol et
  const checkSql = "SELECT * FROM cart WHERE buyer_id = ? AND product_id = ?";
  db.query(checkSql, [buyer_id, product_id], (err, data) => {
    if (err) return res.status(500).json({ error: "Sepet kontrol hatası" });

    if (data.length > 0) {
      // Varsa miktar artır
      const updateSql = "UPDATE cart SET quantity = quantity + ? WHERE cart_id = ?";
      db.query(updateSql, [quantity, data[0].cart_id], (err) => {
        if (err) return res.status(500).json({ error: "Sepet güncellenemedi" });
        res.json({ message: "Sepet güncellendi" });
      });
    } else {
      // Yoksa ekle
      const insertSql = "INSERT INTO cart (buyer_id, product_id, quantity) VALUES (?, ?, ?)";
      db.query(insertSql, [buyer_id, product_id, quantity], (err) => {
        if (err) return res.status(500).json({ error: "Sepete eklenemedi" });
        res.status(201).json({ message: "Sepete eklendi" });
      });
    }
  });
});

// Sepetten Sil
app.delete("/api/cart/:id", (req, res) => {
  const sql = "DELETE FROM cart WHERE cart_id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Silinemedi" });
    res.json({ message: "Silindi" });
  });
});

// --- MESSAGE ENDPOINTS ---

// Konuşmaları Getir
app.get("/api/messages/conversations", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "User ID gerekli" });

  // Kullanıcının dahil olduğu tüm mesajları getir
  const sql = `
    SELECT m.*, 
           sender.first_name as sender_first_name, sender.last_name as sender_last_name, 
           receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.user_id
    JOIN users receiver ON m.receiver_id = receiver.user_id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.sent_at DESC
  `;

  db.query(sql, [userId, userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Mesajlar getirilemedi." });
    res.json(data);
  });
});

// Belirli bir kullanıcıyla olan mesajları getir
app.get("/api/messages/:otherUserId", (req, res) => {
  const userId = req.query.user_id;
  const otherUserId = req.params.otherUserId;

  if (!userId) return res.status(400).json({ error: "User ID gerekli" });

  const sql = `
    SELECT m.*, 
           sender.first_name as sender_first_name, sender.last_name as sender_last_name, 
           receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.user_id
    JOIN users receiver ON m.receiver_id = receiver.user_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) 
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.sent_at ASC
  `;

  db.query(sql, [userId, otherUserId, otherUserId, userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Mesajlar getirilemedi." });
    res.json(data);
  });
});

// Mesaj Gönder
app.post("/api/messages", (req, res) => {
  const { sender_id, receiver_id, product_id, message_text } = req.body;

  const sql = `
    INSERT INTO messages (sender_id, receiver_id, product_id, message_text)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [sender_id, receiver_id, product_id, message_text], (err, result) => {
    if (err) {
      console.error("Message Send Error:", err);
      return res.status(500).json({ error: "Mesaj gönderilemedi." });
    }
    res.status(201).json({ message: "Mesaj gönderildi" });
  });
});

// --- NOTIFICATION ENDPOINTS ---

app.get("/api/notifications", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "User ID gerekli" });

  const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Bildirimler getirilemedi." });
    res.json(data);
  });
});

app.put("/api/notifications/:id/read", (req, res) => {
  const sql = "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Güncellenemedi" });
    res.json({ message: "Okundu olarak işaretlendi" });
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});


// Tüm tagleri listele

app.get("/api/tags", (req, res) => {
  const sql = "SELECT * FROM tags";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// Bir ürünün taglerini almak

app.get("/api/products/:id/tags", (req, res) => {
  const productId = req.params.id;

  const sql = `
    SELECT t.tag_name 
    FROM product_tags pt
    JOIN tags t ON pt.tag_id = t.tag_id
    WHERE pt.product_id = ?
  `;

  db.query(sql, [productId], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data.map(row => row.tag_name));
  });
});



//Ürüne tag ekleme (SellFoodPage için)

app.post("/api/products/:id/tags", (req, res) => {
  const productId = req.params.id;
  const { tags } = req.body; // ["Vegan","Glutensiz"]

  const insertSql = `
    INSERT INTO product_tags (product_id, tag_id)
    VALUES (?, (SELECT tag_id FROM tags WHERE tag_name = ?))
  `;

  tags.forEach(tag => {
    db.query(insertSql, [productId, tag]);
  });

  res.json({ message: "Tags updated" });
});

// Ürün Sil
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;

  // 1) Yorumları sil
  const deleteReviews = "DELETE FROM review WHERE product_id = ?";
  db.query(deleteReviews, [productId], (err) => {
    if (err) {
      console.error("Review delete error:", err);
      return res.status(500).json({ error: "Yorumlar silinemedi." });
    }

    // 2) Tag bağlantılarını sil
    const deleteTags = "DELETE FROM product_tags WHERE product_id = ?";
    db.query(deleteTags, [productId], (err2) => {
      if (err2) {
        console.error("ProductTags delete error:", err2);
        return res.status(500).json({ error: "Ürün tag bağlantıları silinemedi." });
      }

      // 3) Mesajları sil
      const deleteMessages = "DELETE FROM messages WHERE product_id = ?";
      db.query(deleteMessages, [productId], (err3) => {
        if (err3) {
          console.error("Messages delete error:", err3);
          return res.status(500).json({ error: "Mesajlar silinemedi." });
        }

        // 4) Artık ürünü silebiliriz
        const deleteProduct = "DELETE FROM product WHERE product_id = ?";
        db.query(deleteProduct, [productId], (err4, result) => {
          if (err4) {
            console.error("Delete Product Error:", err4);
            return res.status(500).json({ error: "Ürün silinemedi." });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ürün bulunamadı." });
          }

          res.json({ message: "Ürün başarıyla silindi." });
        });
      });
    });
  });
});


// ürünü düzenlemek için
app.put("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const { name, description, price, quantity, photo } = req.body;

  const sql = `
    UPDATE product 
    SET name=?, description=?, price=?, quantity=?, photo=? 
    WHERE product_id=?
  `;

  db.query(sql, [name, description, price, quantity, photo, productId], (err) => {
    if (err) {
      console.error("Product update error:", err);
      return res.status(500).json({ error: "Ürün güncellenemedi" });
    }

    res.json({ message: "Güncelleme başarılı" });
  });
});
// Satıcı başvuruları listeleme - DÜZELTME
app.get("/api/admin/seller-applications", (req, res) => {
  const sql = `
    SELECT 
      sa.application_id,
      sa.user_id,
      sa.is_seller_approved,
      u.first_name,
      u.last_name,
      u.email
    FROM seller_applications sa
    JOIN users u ON sa.user_id = u.user_id
    ORDER BY sa.application_id DESC
  `;
  // ✅ WHERE koşulunu kaldırdık, şimdi hem 0 hem 1 olanları getirir

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Başvurular alınamadı" });
    res.json(result);
  });
});

// başvuru onaylama endpoint

app.put("/api/admin/seller-applications/:id/approve", (req, res) => {
  const id = req.params.id;

  const approveApp = `
    UPDATE seller_applications SET is_seller_approved = 1 
    WHERE application_id = ?
  `;

  db.query(approveApp, [id], (err) => {
    if (err) return res.status(500).json({ error: "Başvuru güncellenemedi" });

    const approveUser = `
      UPDATE users SET is_seller_approved = 1 
      WHERE user_id = (SELECT user_id FROM seller_applications WHERE application_id = ?)
    `;

    db.query(approveUser, [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Kullanıcı güncellenemedi" });

      res.json({ message: "Satıcı onaylandı!" });
    });
  });
});
// Onayı kaldırma endpoint
app.put("/api/admin/seller-applications/:id/unapprove", (req, res) => {
  const id = req.params.id;

  const unapproveApp = `
    UPDATE seller_applications SET is_seller_approved = 0 
    WHERE application_id = ?
  `;

  db.query(unapproveApp, [id], (err) => {
    if (err) return res.status(500).json({ error: "Başvuru güncellenemedi" });

    const unapproveUser = `
      UPDATE users SET is_seller_approved = 0 
      WHERE user_id = (SELECT user_id FROM seller_applications WHERE application_id = ?)
    `;

    db.query(unapproveUser, [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Kullanıcı güncellenemedi" });

      res.json({ message: "Satıcı onayı kaldırıldı!" });
    });
  });
});

// Başvuru red endpoint
app.delete("/api/admin/seller-applications/:id", (req, res) => {
  db.query("DELETE FROM seller_applications WHERE application_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Silinemedi" });
    res.json({ message: "Başvuru reddedildi" });
  });
});


// Seller application insert

// 🟢 Satıcı başvurusu oluşturma
app.post("/api/seller-applications", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id gerekli" });
  }

  db.query(
    "INSERT INTO seller_applications (user_id, is_seller_approved) VALUES (?, 0)",
    [user_id],
    (err, result) => {
      if (err) {
        console.error("Satıcı başvuru hatası:", err);
        return res.status(500).json({ error: "Başvuru oluşturulamadı" });
      }

      res.json({
        success: true,
        message: "Başvuru oluşturuldu",
        application_id: result.insertId
      });
    }
  );
});

// Sipariş ürünlerini getir (product tablosuyla birlikte)
app.get("/api/orders/:orderId/items", (req, res) => {
  const orderId = req.params.orderId;

  const sql = `
    SELECT 
      p.product_id,
      p.name AS product_name,
      p.photo,
      p.price,
      1 AS quantity
    FROM orders o
    JOIN product p ON p.product_id = o.product_id
    WHERE o.order_id = ?
  `;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error("Order items fetch error:", err);
      return res.status(500).json({ error: "Sipariş içeriği alınamadı" });
    }

    res.json(results);
  });
});
