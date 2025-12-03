# TazeKuru - Modern Food Marketplace

**TazeKuru.com**, evinde yemek veya ev yapımı ürün üreten bireylerle, bu ürünleri satın almak isteyen müşterileri buluşturan çevrimiçi bir pazar yeridir.

## 🚀 Proje Hakkında

Bu proje, son kullanıcıya ürün sunan (B2C) bir yapıdadır. Ev hanımları, öğrenciler, şef adayları veya evinden ek gelir elde etmek isteyen herkes sisteme kayıt olup ürünlerini satabilir.

### Özellikler
*   **Satıcı Paneli:** Ürün yükleme, stok yönetimi, sipariş takibi.
*   **Müşteri Arayüzü:** Konum bazlı ürün filtreleme, sepet, sipariş verme.
*   **Sipariş & Ödeme:** Sipariş durum takibi, geçmiş siparişler.
*   **Değerlendirme:** Satıcı puanlama ve yorum sistemi.
*   **İletişim:** Satıcı ve alıcı arası mesajlaşma.

## 🛠️ Teknolojiler

*   **Frontend:** React.js, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Veritabanı:** MySQL
*   **Harita Servisi:** Google Maps API

## 📂 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
*   Node.js
*   MySQL Veritabanı

### 1. Veritabanı Kurulumu
MySQL veritabanınızda `tazekuru_db` adında bir veritabanı oluşturun ve `server/TablesAndFakeData.sql` dosyasını içe aktarın.

### 2. Backend (Sunucu) Kurulumu
```bash
cd server
npm install
npm start
```
Sunucu varsayılan olarak `8081` portunda çalışacaktır. Veritabanı ayarları için `server/server.js` dosyasındaki varsayılan değerleri kullanabilir veya `.env` dosyası oluşturarak özelleştirebilirsiniz.

### 3. Frontend (İstemci) Kurulumu
Yeni bir terminal açın:
```bash
cd client
npm install
npm start
```
Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📝 Veritabanı Şeması
Proje, kullanıcılar, ürünler, siparişler, sepet, ödemeler, yorumlar ve mesajlar tablolarını içeren normalize edilmiş bir ilişkisel veritabanı yapısına sahiptir. Detaylı EER diyagramı ve şema bilgisi için `docs.md` dosyasına göz atabilirsiniz.
