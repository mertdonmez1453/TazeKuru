# Supabase Kurulum Rehberi

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin ve hesap oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından **URL** ve **anon key** bilgilerini kopyalayın

## 2. Environment Variables Ayarlama

`client` klasöründe `.env` dosyası oluşturun:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Veritabanı Tablolarını Oluşturma

Supabase SQL Editor'de aşağıdaki SQL komutlarını çalıştırın:

```sql
-- Users tablosu
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone_number BIGINT,
  email VARCHAR(100) UNIQUE,
  registration_date DATE,
  rating FLOAT DEFAULT 0,
  loyalty_points FLOAT DEFAULT 0,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'seller')),
  is_seller_approved BOOLEAN DEFAULT false
);

-- Product tablosu
CREATE TABLE product (
  product_id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(user_id),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  upload_date DATE,
  photo VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true
);

-- Address tablosu
CREATE TABLE address (
  address_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  city VARCHAR(100),
  street VARCHAR(100),
  neighbourhood VARCHAR(100),
  description VARCHAR(255)
);

-- Cart tablosu
CREATE TABLE cart (
  cart_id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES users(user_id),
  created_at DATE,
  total_amount DECIMAL(10,2)
);

-- Orders tablosu
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES users(user_id),
  seller_id INTEGER REFERENCES users(user_id),
  order_date DATE,
  total_price DECIMAL(10,2),
  status VARCHAR(50),
  delivery_time DATE
);

-- Payment tablosu
CREATE TABLE payment (
  payment_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  user_id INTEGER REFERENCES users(user_id),
  method VARCHAR(50),
  payment_date DATE
);

-- Review tablosu
CREATE TABLE review (
  review_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES product(product_id),
  buyer_id INTEGER REFERENCES users(user_id),
  rating FLOAT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_date DATE DEFAULT CURRENT_DATE
);

-- Messages tablosu (Mesajlaşma)
CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(user_id),
  receiver_id INTEGER REFERENCES users(user_id),
  product_id INTEGER REFERENCES product(product_id),
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false
);

-- Order Items tablosu (Sipariş detayları)
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES product(product_id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## 4. Row Level Security (RLS) Ayarları

Supabase'de güvenlik için RLS politikalarını ayarlayın. Authentication > Policies bölümünden:

- `users` tablosu: Kullanıcılar kendi bilgilerini görebilir/düzenleyebilir
- `product` tablosu: Herkes ürünleri görebilir, sadece sahibi düzenleyebilir
- `orders` tablosu: Kullanıcılar sadece kendi siparişlerini görebilir

## 5. Authentication Ayarları

Supabase Dashboard > Authentication > Settings:
- Email authentication'ı etkinleştirin
- Email templates'i özelleştirebilirsiniz

## Notlar

- PostgreSQL kullanıldığı için `AUTO_INCREMENT` yerine `SERIAL` kullanıldı
- `user_id` için `SERIAL` kullanıldı (otomatik artan)
- Foreign key'ler doğru şekilde ayarlandı


