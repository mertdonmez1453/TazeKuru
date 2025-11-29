import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

function SellerDetailPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Satıcı bilgisi
      const sellerData = await api.sellers.get(id);
      setSeller(sellerData);

      // Satıcının ürünleri
      const productsData = await api.products.list({ seller_id: id });
      setProducts(productsData || []);

      // Satıcı yorumları (şimdilik API'de özel endpoint yok, atlıyoruz veya genel yorumları çekiyoruz)
      // Gerçek implementasyonda: api.reviews.listSellerReviews(id) gibi bir şey olmalı
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (!userData) {
      navigate("/login");
      return;
    }
    navigate(`/messages?seller=${id}`);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!userData || userData.role !== "customer") {
      alert("Yorum yapmak için müşteri hesabı gereklidir!");
      return;
    }

    try {
      // Satıcıya yorum ekle (product_id null olarak)
      await api.reviews.create({
        product_id: null, // Satıcı yorumu olduğu için null
        buyer_id: userData.user_id,
        rating: ratingForm.rating,
        comment: ratingForm.comment
      });

      alert("Yorumunuz eklendi!");
      setShowRatingForm(false);
      setRatingForm({ rating: 5, comment: "" });
      loadData();
    } catch (error) {
      console.error("Yorum hatası:", error);
      alert("Yorum eklenirken hata: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Satıcı bulunamadı</p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/home")}
          className="mb-4 text-orange-600 hover:text-orange-700 flex items-center"
        >
          ← Geri
        </button>

        {/* Satıcı Bilgileri */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-orange-200">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center border-4 border-orange-300">
              <span className="text-orange-700 text-4xl font-semibold">
                {seller.first_name?.[0] || seller.username?.[0] || "👨‍🍳"}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {seller.first_name} {seller.last_name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="text-lg text-gray-700 ml-2 font-semibold">
                    {Number(seller.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  👨‍🍳 Satıcı
                </span>
              </div>
              {seller.email && (
                <p className="text-gray-600 mt-2">{seller.email}</p>
              )}
            </div>
            {userData && userData.role === "customer" && (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  💬 Mesaj Gönder
                </button>
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  ⭐ Puan Ver
                </button>
              </div>
            )}
          </div>

          {/* Puanlama Formu */}
          {showRatingForm && userData?.role === "customer" && (
            <form
              onSubmit={handleRatingSubmit}
              className="bg-orange-50 rounded-lg p-6 mt-6 border-2 border-orange-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Satıcıyı Puanla
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puan (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRatingForm({ ...ratingForm, rating: star })
                      }
                      className={`text-4xl ${star <= ratingForm.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                        } hover:text-yellow-400 transition`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yorum
                </label>
                <textarea
                  value={ratingForm.comment}
                  onChange={(e) =>
                    setRatingForm({ ...ratingForm, comment: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Satıcı hakkında yorumunuzu yazın..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Gönder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRatingForm(false);
                    setRatingForm({ rating: 5, comment: "" });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Satıcının Ürünleri */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🍽️ Satıcının Yemekleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
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
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-orange-600">
                        {product.price} ₺
                      </span>
                      <span className="text-sm text-gray-500 bg-orange-50 px-2 py-1 rounded">
                        📦 {product.quantity} adet
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl">
                <span className="text-6xl mb-4 block">🍽️</span>
                <p className="text-gray-500 text-lg">
                  Bu satıcının henüz yemeği yok
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDetailPage;
