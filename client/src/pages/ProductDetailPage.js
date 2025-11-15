import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Kullanıcı bilgisi
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: userInfo } = await supabase
          .from("users")
          .select("*")
          .eq("email", authUser.email)
          .single();
        setUserData(userInfo);
      }

      // Ürün bilgisi
      const { data: productData, error: productError } = await supabase
        .from("product")
        .select("*")
        .eq("product_id", id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Satıcı bilgisi
      if (productData?.seller_id) {
        const { data: sellerData } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", productData.seller_id)
          .single();
        setSeller(sellerData);
      }

      // Yorumlar
      const { data: reviewsData } = await supabase
        .from("review")
        .select(`
          *,
          users:buyer_id (first_name, last_name, username)
        `)
        .eq("product_id", id)
        .order("review_date", { ascending: false });

      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!userData || userData.role !== "customer") {
      alert("Sipariş vermek için müşteri hesabı gereklidir!");
      return;
    }

    if (!product || product.quantity < 1) {
      alert("Ürün stokta yok!");
      return;
    }

    try {
      // Sipariş oluştur
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            buyer_id: userData.user_id,
            seller_id: product.seller_id,
            order_date: new Date().toISOString().split("T")[0],
            total_price: product.price,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Order items ekle
      await supabase.from("order_items").insert([
        {
          order_id: orderData.order_id,
          product_id: product.product_id,
          quantity: 1,
          price: product.price,
        },
      ]);

      // Stok güncelle
      await supabase
        .from("product")
        .update({ quantity: product.quantity - 1 })
        .eq("product_id", product.product_id);

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
      // Önce sipariş kontrolü yapılabilir (şimdilik atlıyoruz)
      const { error } = await supabase.from("review").insert([
        {
          product_id: product.product_id,
          buyer_id: userData.user_id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          review_date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

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
                        {seller.rating.toFixed(1)}
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
                {userData?.role === "customer" && (
                  <>
                    <button
                      onClick={handleOrder}
                      disabled={product.quantity < 1}
                      className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🛒 Sipariş Ver
                    </button>
                    <button
                      onClick={handlePayment}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      💳 Ödeme Yap
                    </button>
                  </>
                )}
                {userData && (
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
                        className={`text-3xl ${
                          star <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"
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

