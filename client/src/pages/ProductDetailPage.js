import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    photo: ""
  });
  


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    loadData();
  }, [id]);

  // ürün düzenleme fonksiyonu
  const handleEditSave = async () => {
  try {
    await api.products.update(product.product_id, editForm);
    alert("Ürün güncellendi!");
    setEditMode(false);
    loadData(); // güncel veriyi tekrar çek
  } catch (err) {
    alert("Güncellenemedi: " + err.message);
  }
};


  const loadData = async () => {
    try {
      setLoading(true);
      // Ürün bilgisi
      const productData = await api.products.get(id);
      setProduct(productData);

      // Satıcı bilgisi
      if (productData?.seller_id) {
        const sellerData = await api.sellers.get(productData.seller_id);
        setSeller(sellerData);
      }

      // Yorumlar
      const reviewsData = await api.reviews.list(id);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // ÜRün düzenleme
  const handleDeleteProduct = async () => {
    if (!window.confirm("Bu ürünü silmek istediğine emin misin?")) return;

    try {
      await api.products.delete(product.product_id);
      alert("Ürün başarıyla silindi!");
      navigate("/home");
    } catch (error) {
      alert("Ürün silinemedi: " + error.message);
    }
  };


  const handleAddToCart = async () => {
    if (!userData || userData.role !== "customer") {
      alert("Sepete eklemek için müşteri hesabı gereklidir!");
      return;
    }

    if (!product || product.quantity < 1) {
      alert("Ürün stokta yok!");
      return;
    }

    try {
      await api.cart.add({
        buyer_id: userData.user_id,
        product_id: product.product_id,
        quantity: 1
      });
      alert("Ürün sepete eklendi!");
    } catch (err) {
      alert("Sepete eklenemedi: " + err.message);
    }
  };

  const handleOrder = async () => {
    // Doğrudan sipariş ver (Hızlı Al)
    if (!userData || userData.role !== "customer") {
      alert("Sipariş vermek için müşteri hesabı gereklidir!");
      return;
    }

    if (!product || product.quantity < 1) {
      alert("Ürün stokta yok!");
      return;
    }

    try {
      await api.orders.create({
        buyer_id: userData.user_id,
        seller_id: product.seller_id,
        total_price: product.price,
        items: [{
          product_id: product.product_id,
          quantity: 1,
          price: product.price
        }]
      });

      alert("Sipariş başarıyla oluşturuldu!");
      navigate("/orders");
    } catch (error) {
      console.error("Sipariş hatası:", error);
      alert("Sipariş oluşturulurken hata: " + error.message);
    }
  };

  const handlePayment = async () => {
    alert("Ödeme sayfası yakında eklenecek!");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userData || userData.role !== "customer") {
      alert("Yorum yapmak için müşteri hesabı gereklidir!");
      return;
    }

    try {
      await api.reviews.create({
        product_id: product.product_id,
        buyer_id: userData.user_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      alert("Yorumunuz eklendi!");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      loadData();
    } catch (error) {
      console.error("Yorum hatası:", error);
      alert("Yorum eklenirken hata: " + error.message);
    }
  };

  const handleMessage = () => {
    if (!userData) {
      navigate("/login");
      return;
    }
    navigate(`/messages?seller=${seller?.user_id}&product=${product?.product_id}`);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Ürün bulunamadı</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/home")}
          className="mb-4 text-orange-600 hover:text-orange-700 flex items-center"
        >
          ← Geri
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Sol: Resim */}
            <div>
              {product.photo ? (
                <img
                  src={product.photo}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-xl flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
              )}
            </div>

            {/* Sağ: Bilgiler */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>

              {/* Puan */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>{star <= averageRating ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} yorum)
                </span>
              </div>

              <p className="text-gray-700 text-lg mb-6">{product.description}</p>

              {/* Satıcı Bilgisi */}
              {seller && (
                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Satıcı</p>
                  <p className="font-semibold text-gray-800">
                    {seller.first_name} {seller.last_name}
                  </p>
                  {seller.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {Number(seller.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Fiyat ve Stok */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-orange-600 mb-2">
                  {product.price} ₺
                </p>
                <p className="text-gray-600">
                  Stok: {product.quantity} adet
                </p>
              </div>

              {/* Butonlar */}
              <div className="space-y-3">
                {/* 🔥 SATICI İSE DÜZENLE / SİL BUTONLARI */}
                {userData?.role === "seller" && userData.user_id === product.seller_id && (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setEditForm({
                          name: product.name,
                          description: product.description,
                          price: product.price,
                          quantity: product.quantity,
                          photo: product.photo
                        });
                        setEditMode(true);
                      }}
                      className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition"
                    >
                      ✏️ Ürünü Düzenle
                    </button>


                    <button
                      onClick={handleDeleteProduct}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      🗑️ Ürünü Sil
                    </button>
                  </div>
                )}

                {userData?.role === "customer" && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={product.quantity < 1}
                      className="w-full bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🛒 Sepete Ekle
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={product.quantity < 1}
                      className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⚡ Hemen Al
                    </button>
                  </>
                )}
                {userData?.role === "customer" && userData.user_id !== product.seller_id && (
                  <button
                    onClick={handleMessage}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    💬 Satıcıya Mesaj Gönder
                  </button>
                )}
              </div>
            </div>
          </div>
          {editMode && (
            <div className="bg-orange-50 border border-orange-300 p-6 rounded-xl mb-6">
              <h2 className="text-2xl font-bold mb-4">Ürünü Düzenle</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Ürün adı"
                />

                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Açıklama"
                />

                <input
                  type="number"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Fiyat"
                />

                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Stok miktarı"
                />

                <input
                  type="text"
                  value={editForm.photo}
                  onChange={e => setEditForm({ ...editForm, photo: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Fotoğraf URL"
                />

                <div className="flex gap-4">
                  <button
                    onClick={handleEditSave}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700"
                  >
                    Kaydet
                  </button>

                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Yorumlar Bölümü */}
          <div className="border-t border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Yorumlar</h2>
              {userData?.role === "customer" && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {showReviewForm ? "İptal" : "Yorum Yap"}
                </button>
              )}
            </div>

            {/* Yorum Formu */}
            {showReviewForm && userData?.role === "customer" && (
              <form onSubmit={handleReviewSubmit} className="bg-orange-50 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puan (1-5)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-3xl ${star <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"
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
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Yorumunuzu yazın..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Yorumu Gönder
                </button>
              </form>
            )}

            {/* Yorum Listesi */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.review_id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-600 font-semibold">
                            {review.users?.first_name?.[0] || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {review.users?.first_name} {review.users?.last_name ||
                              review.users?.username ||
                              "Anonim"}
                          </p>
                          <div className="flex text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                {star <= review.rating ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.review_date).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Henüz yorum yapılmamış
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
