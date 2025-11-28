# 1. Proje Konusu ve Domain Tanımı
Bu proje, **TazeKuru.com** adında çevrimiçi bir platformun veritabanı tasarımını ve uygulamasını kapsamaktadır. Platform, evinde yemek veya ev yapımı ürün üreten bireylerle, bu ürünleri satın almak isteyen müşterileri buluşturur. Ev hanımları, öğrenciler, şef adayları veya evinden ek gelir elde etmek isteyen herkes sisteme kayıt olup ürünlerini satabilir.

Bu sistem, son kullanıcıya ürün sunan (B2C) bir yapıdadır ve Getir, Armut, Apsiyon gibi firmalara benzer bir iş modeline sahiptir. Ayrıca kullanıcıların mobil olarak konum değiştirseler bile hizmet sunabilmelerine olanak tanır.

**Domain:**
*   **Sektör:** Yemek ve ev yapımı ürün pazarı
*   **Hedef kullanıcılar:** Evinde üretim yapan bireyler (Satıcılar) ve çevredeki alıcılar (Müşteriler)
*   **Hizmet tipi:** Online sipariş ve teslimat tabanlı pazar yeri

# 2. Gereksinim Analizi
Günümüzde ev yapımı ürün satıcılarının çoğu, sosyal medya veya mesajlaşma uygulamaları üzerinden sipariş alıyor. Bu durum, sipariş takibi, ödeme güvenliği ve müşteri memnuniyetinde zorluk yaratıyor.

Belirlenen ihtiyaçlar arasında satıcıların ürünlerini kolayca yükleyebileceği bir sistem, alıcıların çevredeki ürünleri filtreleyebilmesi, sipariş takibi, ödeme geçmişi, değerlendirme ve yorum özellikleri bulunur.

**Belirlenen İhtiyaçlar:**
*   Satıcıların ürünlerini kolayca yükleyebileceği, yönetebileceği bir sistem
*   Alıcıların yakın çevredeki ürünleri filtreleyip sipariş verebileceği bir arayüz
*   Sipariş takibi, ödeme geçmişi, değerlendirme ve yorum özellikleri
*   Satıcı ve alıcı arasında iletişim (mesajlaşma)

**Fonksiyonel Gereksinimler:**
*   Kullanıcı kayıt / giriş sistemi (Müşteri ve Satıcı rol seçimi ile)
*   Satıcı ve alıcı rollerinin ayrılması ve yetkilendirme
*   Ürün listeleme, stok yönetimi, fotoğraf yükleme
*   Sepet ve sipariş işlemleri
*   Ödeme yöntemleri (nakit / kart)
*   Yorum ve puanlama sistemi
*   Kullanıcılar arası mesajlaşma sistemi

# 3. Kavramsal Tasarım (EER Diyagramı)
EER diyagramında temel varlıklar: `User`, `Address`, `Product`, `Cart`, `Order`, `Payment`, `Review`, `Messages`.

**Varlıklar (Entities):**

*   **User**
    *   `user_id` (INT, PK, Auto Increment)
    *   `username` (VARCHAR, Unique)
    *   `password` (VARCHAR)
    *   `first_name` (VARCHAR)
    *   `last_name` (VARCHAR)
    *   `phone_number` (BIGINT)
    *   `email` (VARCHAR)
    *   `registration_date` (DATE)
    *   `rating` (FLOAT)
    *   `loyalty_points` (FLOAT)
    *   `role` (VARCHAR) - 'customer' veya 'seller'
    *   `is_seller_approved` (BOOLEAN)

*   **Address**
    *   `address_id` (INT, PK)
    *   `user_id` (INT, FK)
    *   `city` (VARCHAR)
    *   `street` (VARCHAR)
    *   `neighbourhood` (VARCHAR)
    *   `description` (VARCHAR)

*   **Product**
    *   `product_id` (INT, PK)
    *   `seller_id` (INT, FK -> User)
    *   `name` (VARCHAR)
    *   `description` (TEXT)
    *   `price` (DECIMAL)
    *   `upload_date` (DATE)
    *   `photo` (VARCHAR)
    *   `quantity` (INT)
    *   `is_available` (BOOLEAN)

*   **Cart**
    *   `cart_id` (INT, PK)
    *   `buyer_id` (INT, FK -> User)
    *   `created_at` (DATE)
    *   `total_amount` (DECIMAL)

*   **Orders**
    *   `order_id` (INT, PK)
    *   `buyer_id` (INT, FK -> User)
    *   `seller_id` (INT, FK -> User)
    *   `order_date` (DATE)
    *   `total_price` (DECIMAL)
    *   `status` (VARCHAR)
    *   `delivery_time` (DATE)

*   **Payment**
    *   `payment_id` (INT, PK)
    *   `order_id` (INT, FK -> Orders)
    *   `user_id` (INT, FK -> User)
    *   `method` (VARCHAR)
    *   `payment_date` (DATE)

*   **Review**
    *   `review_id` (INT, PK)
    *   `order_id` (INT, FK -> Orders)
    *   `product_id` (INT, FK -> Product)
    *   `buyer_id` (INT, FK -> User)
    *   `rating` (FLOAT)
    *   `comment` (TEXT)
    *   `review_date` (DATE)

*   **Messages**
    *   `message_id` (INT, PK, Auto Increment)
    *   `sender_id` (INT, FK -> User)
    *   `receiver_id` (INT, FK -> User)
    *   `product_id` (INT, FK -> Product)
    *   `message_text` (TEXT)
    *   `sent_at` (DATETIME)
    *   `is_read` (BOOLEAN)

**İlişkiler:**
*   Bir `User`, birden fazla `Address`'e sahip olabilir.
*   Bir `User` (seller) birçok `Product` satabilir.
*   Bir `User` (buyer) birçok `Product` satın alabilir.
*   Bir `User` (buyer) birçok `Order` verebilir.
*   Bir `User` (seller) birçok `Order` alabilir.
*   Her `Order`, bir `Payment` içerir.
*   Her `Product`, birden fazla `Review` alabilir.
*   Kullanıcılar birbirlerine `Messages` tablosu üzerinden mesaj gönderebilir.

# 4. Mantıksal Tasarım
Tüm tablolar 3NF seviyesine kadar normalize edilmiştir. Anahtarlar ve yabancı anahtarlar oluşturulmuştur.

# 5. Veritabanı Uyarlaması
*   **Veritabanı Adı:** `tazekuru_db`
*   **VTYS:** MySQL (MySQL 8.0+)
*   **Kısıtlar:** `UNIQUE(username)`, `FOREIGN KEY` bağlantıları, `AUTO_INCREMENT` ID'ler.

# 6. Geliştirilecek Uygulama Programı
*   **Uygulama Tipi:** Web Uygulaması (Single Page Application)
*   **Frontend:** React.js (Tailwind CSS ile)
*   **Backend:** Node.js / Express.js
*   **Veritabanı Bağlantısı:** `mysql2` kütüphanesi ile doğrudan SQL sorguları
*   **Menüler:** Ana Sayfa, Ürün Detay, Profil, Siparişlerim, Mesajlar, Satıcı Ol/Ürün Ekle.
