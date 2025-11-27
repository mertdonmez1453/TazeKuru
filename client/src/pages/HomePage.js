import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    loadProducts();
  }, []);

  // 🔥 Kullanıcı bilgisini backend'den çekiyoruz
  const loadUser = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    const res = await fetch("http://localhost:8081/api/get-current-user", {
      headers: { "user-id": storedUser.user_id }
    });

    const data = await res.json();
    if (res.ok) setUserData(data.user);
  };

  // 🔥 Ürün + satıcı verisi backend'den geliyor
  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/yemekler");
      const data = await res.json();

      setProducts(data || []);

      // Seller listesi oluşturuluyor
      const sellerList = [];
      data.forEach(p => {
        if (!sellerList.find(s => s.user_id === p.seller_id) && p.seller_id)
          sellerList.push({ user_id: p.seller_id, rating: p.rating, first_name: p.first_name, last_name: p.last_name });
      });

      setSellers(sellerList.slice(0, 10));

    } catch (e) {
      console.log("Veri yükleme hatası:", e);
    }
  };

  // 🔥 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // 🔥 Arama + Filtre + Sıralama
  const filteredProducts = products
    .filter(product => {
      const search = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const priceMatch =
        filterPrice === "all" ||
        (filterPrice === "low" && product.price <= 50) ||
        (filterPrice === "medium" && product.price > 50 && product.price <= 150) ||
        (filterPrice === "high" && product.price > 150);

      const ratingMatch =
        filterRating === "all" ||
        (filterRating === "high" && product.rating >= 4) ||
        (filterRating === "medium" && product.rating >= 3 && product.rating < 4) ||
        (filterRating === "low" && product.rating < 3);

      return search && priceMatch && ratingMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return new Date(b.upload_date) - new Date(a.upload_date);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">

      {/* 🔥 Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">

          <h1 className="text-3xl font-bold text-orange-600 cursor-pointer"
              onClick={() => navigate("/home")}>
            🍽️ Taze Kuru
          </h1>

          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/messages")} className="hover:text-orange-600">💬</button>
            <button onClick={() => navigate("/profile")} className="hover:text-orange-600">👤</button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
              Çıkış
            </button>
          </div>
        </div>
      </nav>

        {userData && (
          <button
          onClick={() => navigate("/sell")}
          className="fixed bottom-6 right-6 bg-orange-600 text-white px-5 py-3 rounded-full shadow-xl text-lg hover:bg-orange-700 transition"
          >
            🍽 Yemek Sat
          </button>
        )}


      {/* 🔍 Arama + Filtre Alanı */}
      <div className="max-w-7xl mx-auto p-6">
        <input type="text" placeholder="Yemek ara..." className="w-full p-3 border rounded mb-5"
               value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

        <div className="flex gap-4 mb-5">
          <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="border p-2 rounded">
            <option value="all">Tüm Fiyatlar</option>
            <option value="low">0-50 ₺</option>
            <option value="medium">50-150 ₺</option>
            <option value="high">150+ ₺</option>
          </select>
          <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="border p-2 rounded">
            <option value="all">Tüm Puanlar</option>
            <option value="high">4+⭐</option>
            <option value="medium">3-4⭐</option>
            <option value="low">3 Altı⭐</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border p-2 rounded">
            <option value="newest">En Yeni</option>
            <option value="price-low">Fiyat ↑</option>
            <option value="price-high">Fiyat ↓</option>
            <option value="rating">Puan</option>
          </select>
        </div>

        {/* 🔥 Ürünler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <div key={p.product_id} 
                onClick={() => navigate(`/product/${p.product_id}`)}
                className="bg-white shadow rounded-xl p-3 cursor-pointer hover:scale-[1.03] transition border"
              >
                <img src={p.photo || "https://placehold.co/300x200"} className="h-40 w-full object-cover rounded"/>
                <h2 className="font-semibold text-lg mt-2">{p.name}</h2>
                <p className="text-gray-600 line-clamp-2">{p.description}</p>
                <div className="flex justify-between mt-2 text-orange-600 font-bold">{p.price} ₺</div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">🍽 Ürün bulunamadı</p>
          )}
        </div>

        {/* ⭐ Satıcılar */}
        <div className="mt-10 bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-3">⭐ Popüler Satıcılar</h3>
          {sellers.length > 0 ? sellers.map(s => (
            <p key={s.user_id} className="p-2 border-b last:border-none cursor-pointer hover:text-orange-600"
               onClick={() => navigate(`/seller/${s.user_id}`)}>
              👤 {s.first_name} {s.last_name} — ⭐ {s.rating}
            </p>
          )) : <p className="text-gray-500">Satıcı Yok</p>}
        </div>

      </div>

    </div>
  );
}

export default HomePage;
  