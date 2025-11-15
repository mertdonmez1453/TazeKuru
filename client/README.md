# Taze Kuru - Modern Food Marketplace

Modern ve kullanıcı dostu bir yemek pazar yeri uygulaması. Supabase ile güçlendirilmiş, Tailwind CSS ile tasarlanmış.

## Özellikler

- 🍽️ **Yemek Seç**: Ev yapımı lezzetleri keşfedin ve sipariş verin
- 💰 **Yemek Sat**: Kendi yemeklerinizi satın ve para kazanın
- 👤 **Profil Yönetimi**: Profil bilgilerinizi düzenleyin
- 🔍 **Arama ve Filtreleme**: Yemekleri arayın ve fiyat aralığına göre filtreleyin
- ⭐ **Satıcı Değerlendirmeleri**: Popüler satıcıları görüntüleyin
- 🎨 **Modern UI**: Tailwind CSS ile tasarlanmış responsive arayüz

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Supabase yapılandırması için `README_SUPABASE.md` dosyasına bakın

3. `.env` dosyası oluşturun:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Uygulamayı başlatın:
```bash
npm start
```

## Teknolojiler

- React 19
- React Router DOM
- Supabase (Authentication & Database)
- Tailwind CSS
- Axios

## Sayfalar

- `/` - Hoş geldiniz sayfası
- `/login` - Giriş sayfası
- `/signup` - Kayıt sayfası
- `/home` - Ana sayfa (Yemek listesi, arama, filtreleme)
- `/profile` - Profil sayfası
- `/sell` - Yemek satış sayfası

## Notlar

- Supabase projesi oluşturulmalı ve veritabanı tabloları kurulmalıdır
- Authentication Supabase Auth kullanılarak yapılmaktadır
- Tüm veriler Supabase PostgreSQL veritabanında saklanmaktadır
