import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { mockData } from "../lib/mockData";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [userData, setUserData] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [activeOrders, setActiveOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      loadActiveOrders(user.user_id);
    }
    loadProducts();
    loadSellers();

    const handleLocationChange = () => {
      loadProducts();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  const loadProducts = async () => {
    try {
      const filters = {};
      if (userData?.role === "seller" && userData?.is_seller_approved) {
        filters.seller_id = userData.user_id;
      }

      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        const { lat, lon } = JSON.parse(storedLocation);
        filters.user_lat = lat;
        filters.user_lon = lon;
      }

      const productsData = await api.products.list(filters);
      setProducts(productsData && productsData.length > 0 ? productsData : []);
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setProducts(mockData.products);
    }
  };

  const loadSellers = async () => {
    try {
      const sellersData = await api.sellers.list();
      setSellers(sellersData && sellersData.length > 0 ? sellersData : mockData.sellers);
    } catch (error) {
      console.error("Satıcılar yüklenirken hata:", error);
      setSellers(mockData.sellers);
    }
  };

  const loadActiveOrders = async (userId) => {
    try {
      const ordersData = await api.orders.listMyOrders(userId);
      const pending = ordersData?.filter(o => o.status === 'pending').slice(0, 3) || [];
      setActiveOrders(pending);
    } catch (error) {
      console.error("Siparişler yüklenirken hata:", error);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      const matchesTags = selectedTags.length === 0 ||
        (product.tags && selectedTags.some(tag => product.tags.includes(tag)));
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured": return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "popular": return (b.views || 0) - (a.views || 0);
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return (b.users?.rating || 0) - (a.users?.rating || 0);
        case "newest":
        default: return new Date(b.upload_date) - new Date(a.upload_date);
      }
    });

  const featuredProducts = products.filter(p => p.featured).slice(0, 3);
  const trendingProducts = products.sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-emerald-500 to-lime-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{mockData.stats.totalProducts}+</span>
              <span className="text-sm opacity-90">Taze Ürün</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{mockData.stats.totalSellers}+</span>
              <span className="text-sm opacity-90">Yerel Satıcı</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{mockData.stats.totalOrders}+</span>
              <span className="text-sm opacity-90">Mutlu Müşteri</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{mockData.stats.avgRating}⭐</span>
              <span className="text-sm opacity-90">Ortalama Puan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${!selectedCategory
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              🍽️ Tümü
            </button>
            {mockData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${selectedCategory === cat.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⭐</span>
              <span>Öne Çıkan Ürünler</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <div
                  key={product.product_id}
                  className="card hover:scale-105 cursor-pointer group overflow-hidden relative"
                  onClick={() => navigate(`/product/${product.product_id}`)}
                >
                  <div className="absolute top-4 right-4 z-10">
                    <span className="badge-warning">⭐ Öne Çıkan</span>
                  </div>
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-bold text-gradient-primary">{product.price} ₺</span>
                      <span className="text-sm text-gray-500">👁️ {product.views} görüntüleme</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl">
                🔍
              </div>
              <input
                type="text"
                placeholder="Yemek ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-14"
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-modern">
              <option value="featured">⭐ Öne Çıkanlar</option>
              <option value="popular">🔥 Popüler</option>
              <option value="newest">🆕 En Yeni</option>
              <option value="price-low">💰 Fiyat: Düşük</option>
              <option value="price-high">💰 Fiyat: Yüksek</option>
              <option value="rating">⭐ En İyi Puan</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                ☰ Liste
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {mockData.tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition ${selectedTags.includes(tag)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {userData?.role === "seller" && userData?.is_seller_approved ? "🍽️ Yemeklerim" : "🍽️ Tüm Yemekler"}
              </h2>
              <span className="text-gray-600">{filteredProducts.length} ürün</span>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className={`card hover:scale-105 cursor-pointer group overflow-hidden ${viewMode === 'list' ? 'flex flex-row' : ''}`}
                    onClick={() => navigate(`/product/${product.product_id}`)}
                  >
                    <img
                      src={product.photo}
                      alt={product.name}
                      className={`object-cover group-hover:scale-110 transition-transform duration-500 ${viewMode === 'grid' ? 'w-full h-56' : 'w-48 h-full'
                        }`}
                    />
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition"
                          title="Hızlı Görünüm"
                        >
                          👁️
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-3xl font-bold text-gradient-primary">{product.price} ₺</span>
                        <span className="badge-success">📦 {product.quantity}</span>
                      </div>
                      {product.users && (
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm text-gray-600">👨‍🍳 {product.users.first_name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium text-gray-700">{product.users.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <span className="text-8xl mb-4 block animate-pulse-slow">🍽️</span>
                  <p className="text-gray-500 text-xl">Yemek bulunamadı</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Tracking */}
            {userData?.role === "customer" && activeOrders.length > 0 && (
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📦</span>
                  <span>Aktif Siparişler</span>
                </h2>
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <div key={order.order_id} className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">Sipariş #{order.order_id}</span>
                        <span className="badge-warning text-xs">⏳ Beklemede</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {order.seller_name} {order.seller_lastname}
                      </p>
                      <p className="text-emerald-600 font-bold">{order.total_price} ₺</p>
                      <button
                        onClick={() => navigate('/orders')}
                        className="text-xs text-emerald-600 hover:underline mt-2"
                      >
                        Detayları Gör →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Products */}
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔥</span>
                <span>Trend Ürünler</span>
              </h2>
              <div className="space-y-3">
                {trendingProducts.slice(0, 4).map(product => (
                  <div
                    key={product.product_id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-emerald-50 cursor-pointer transition border border-emerald-100"
                    onClick={() => navigate(`/product/${product.product_id}`)}
                  >
                    <img src={product.photo} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-emerald-600 font-bold text-sm">{product.price} ₺</p>
                      <p className="text-xs text-gray-500">🔥 {product.sales} satış</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sellers */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>👨‍🍳</span>
                <span>En İyi Satıcılar</span>
              </h2>
              <div className="space-y-3">
                {sellers.slice(0, 4).map(seller => (
                  <div
                    key={seller.user_id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 cursor-pointer transition border border-emerald-100"
                    onClick={() => navigate(`/seller/${seller.user_id}`)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center text-white font-bold text-lg">
                      {seller.first_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{seller.first_name} {seller.last_name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">⭐</span>
                        <span className="text-xs text-gray-600">{seller.rating?.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-emerald-600">{seller.badge}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <img
                src={quickViewProduct.photo}
                alt={quickViewProduct.name}
                className="w-full h-96 object-cover"
              />
              <div className="p-8">
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="float-right p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{quickViewProduct.name}</h2>
                <p className="text-gray-600 mb-6">{quickViewProduct.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {quickViewProduct.tags?.map(tag => (
                    <span key={tag} className="badge-success">{tag}</span>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Satıcı:</span>
                    <span className="font-semibold">
                      👨‍🍳 {quickViewProduct.users.first_name} {quickViewProduct.users.last_name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{quickViewProduct.users.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    👁️ {quickViewProduct.views} görüntüleme • 🔥 {quickViewProduct.sales} satış
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-4xl font-bold text-gradient-primary">{quickViewProduct.price} ₺</span>
                    <span className="badge-success">📦 {quickViewProduct.quantity} stokta</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/product/${quickViewProduct.product_id}`)}
                  className="btn-primary w-full text-lg"
                >
                  Detaylı İncele →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
