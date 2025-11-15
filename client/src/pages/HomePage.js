import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userData) {
      loadProducts();
      loadSellers();
    }
  }, [userData]);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);
    if (authUser) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .single();
      setUserData(data);
    }
  };

  const loadProducts = async () => {
    try {
      let query = supabase
        .from("product")
        .select("*")
        .eq("is_available", true);

      // Satıcı ise sadece kendi yemeklerini göster
      if (userData?.role === "seller" && userData?.is_seller_approved) {
        query = query.eq("seller_id", userData.user_id);
      }

      const { data: productsData, error: productsError } = await query
        .order("upload_date", { ascending: false });

      if (productsError) throw productsError;

      if (productsData && productsData.length > 0) {
        const sellerIds = [...new Set(productsData.map(p => p.seller_id))];
        const { data: sellersData } = await supabase
          .from("users")
          .select("user_id, username, first_name, last_name, rating")
          .in("user_id", sellerIds);

        const productsWithSellers = productsData.map(product => {
          const seller = sellersData?.find(s => s.user_id === product.seller_id);
          return { ...product, users: seller || null };
        });

        setProducts(productsWithSellers);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setProducts([]);
    }
  };

  const loadSellers = async () => {
    try {
      // Önce tüm satıcıları kontrol et (onaylı olmayanlar da dahil)
      const { data: allSellers, error: allError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "seller")
        .order("rating", { ascending: false })
        .limit(20);

      if (allError) {
        console.error("Satıcılar yüklenirken hata:", allError);
        // Hata olsa bile devam et, sadece onaylı olanları göster
        const { data: approvedSellers } = await supabase
          .from("users")
          .select("*")
          .eq("role", "seller")
          .eq("is_seller_approved", true)
          .order("rating", { ascending: false })
          .limit(10);
        setSellers(approvedSellers || []);
        return;
      }

      // Onaylı satıcıları filtrele
      const approvedSellers = (allSellers || []).filter(
        (seller) => seller.is_seller_approved === true
      );

      // Eğer onaylı satıcı yoksa, tüm satıcıları göster (test için)
      if (approvedSellers.length === 0 && allSellers && allSellers.length > 0) {
        console.log("Onaylı satıcı yok, tüm satıcılar gösteriliyor (test modu)");
        setSellers(allSellers.slice(0, 10));
      } else {
        setSellers(approvedSellers.slice(0, 10));
      }
    } catch (error) {
      console.error("Satıcılar yüklenirken hata:", error);
      setSellers([]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPrice =
        filterPrice === "all" ||
        (filterPrice === "low" && product.price <= 50) ||
        (filterPrice === "medium" && product.price > 50 && product.price <= 150) ||
        (filterPrice === "high" && product.price > 150);

      const matchesRating =
        filterRating === "all" ||
        (filterRating === "high" && product.users?.rating >= 4) ||
        (filterRating === "medium" && product.users?.rating >= 3 && product.users?.rating < 4) ||
        (filterRating === "low" && product.users?.rating < 3);

      return matchesSearch && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.users?.rating || 0) - (a.users?.rating || 0);
        case "newest":
        default:
          return new Date(b.upload_date) - new Date(a.upload_date);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1
                className="text-3xl font-bold text-orange-600 cursor-pointer flex items-center"
                onClick={() => navigate("/home")}
              >
                🍽️ Taze Kuru
              </h1>
              <div className="hidden md:flex space-x-4">
                {userData?.role === "seller" && userData?.is_seller_approved ? (
                  <>
                    <button
                      onClick={() => navigate("/sell")}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition flex items-center"
                    >
                      💰 Yemek Sat
                    </button>
                    <button
                      onClick={() => navigate("/home")}
                      className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition flex items-center"
                    >
                      🍽️ Yemeklerim
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/home")}
                      className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition flex items-center"
                    >
                      🍴 Yemek Seç
                    </button>
                    {userData?.role === "customer" && (
                      <button
                        onClick={() => navigate("/orders")}
                        className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition flex items-center"
                      >
                        📦 Siparişlerim
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => navigate("/messages")}
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition flex items-center"
                >
                  💬 Mesajlar
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition flex items-center"
                >
                  👤 Profil
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userData && (
                <span className="text-sm text-gray-600 hidden md:block">
                  {userData.role === "seller" ? "👨‍🍳 Satıcı" : "👤 Müşteri"}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Arama ve Filtreleme Barı */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arama Barı */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Yemek ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <span className="absolute left-4 top-3.5 text-xl">🍴</span>
              </div>
            </div>

            {/* Fiyat Filtresi */}
            <div>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">💰 Tüm Fiyatlar</option>
                <option value="low">0-50 ₺</option>
                <option value="medium">50-150 ₺</option>
                <option value="high">150+ ₺</option>
              </select>
            </div>

            {/* Puan Filtresi */}
            <div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">⭐ Tüm Puanlar</option>
                <option value="high">4+ Yıldız</option>
                <option value="medium">3-4 Yıldız</option>
                <option value="low">3 Altı</option>
              </select>
            </div>
          </div>

          {/* Sıralama */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mr-2">Sırala:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">🆕 En Yeni</option>
              <option value="price-low">💰 Fiyat: Düşük-Yüksek</option>
              <option value="price-high">💰 Fiyat: Yüksek-Düşük</option>
              <option value="rating">⭐ En Yüksek Puan</option>
            </select>
          </div>
        </div>

        {/* Ürünler ve Satıcılar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ana İçerik - Ürünler */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                {userData?.role === "seller" && userData?.is_seller_approved
                  ? "🍽️ Yemeklerim"
                  : "🍽️ Yemekler"}
              </h2>
              {userData?.role === "seller" && userData?.is_seller_approved && (
                <button
                  onClick={() => navigate("/sell")}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <span>➕</span>
                  <span>Yeni Yemek Ekle</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border-2 border-orange-100"
                    onClick={() => navigate(`/product/${product.product_id}`)}
                  >
                    {product.photo ? (
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-orange-600">
                          {product.price} ₺
                        </span>
                        <span className="text-sm text-gray-500 bg-orange-50 px-2 py-1 rounded">
                          📦 {product.quantity} adet
                        </span>
                      </div>
                      {product.users && (
                        <div className="mt-2 pt-2 border-t border-orange-100">
                          <p className="text-sm text-gray-600">
                            👨‍🍳 {product.users.first_name} {product.users.last_name}
                          </p>
                          {product.users.rating && (
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm text-gray-600 ml-1">
                                {product.users.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <span className="text-6xl mb-4 block">🍽️</span>
                  <p className="text-gray-500 text-lg">Yemek bulunamadı</p>
                </div>
              )}
            </div>
          </div>

          {/* Yan Bar - Popüler Satıcılar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border-2 border-orange-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                ⭐ Popüler Satıcılar
              </h2>
              <div className="space-y-4">
                {sellers.length > 0 ? (
                  sellers.map((seller) => (
                    <div
                      key={seller.user_id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition border border-orange-100"
                      onClick={() => navigate(`/seller/${seller.user_id}`)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-orange-700 font-semibold text-lg">
                          {seller.first_name?.[0] || seller.username?.[0] || "👨‍🍳"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {seller.first_name} {seller.last_name}
                        </p>
                        <div className="flex items-center">
                          <span className="text-yellow-500 text-sm">⭐</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {seller.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Henüz satıcı yok
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
