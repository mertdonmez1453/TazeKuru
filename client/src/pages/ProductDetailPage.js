import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    const res = await fetch(`http://localhost:8081/api/product/${id}`);
    const data = await res.json();

    setProduct(data.product);
    setSeller(data.seller);
    setLoading(false);
  };

  const loadReviews = async () => {
    const res = await fetch(`http://localhost:8081/api/reviews/${id}`);
    const data = await res.json();
    setReviews(data || []);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-orange-600">
        🍽️ Ürün yükleniyor...
      </div>
    );

  if (!product)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-lg text-gray-500">
        Ürün bulunamadı ❌
        <button
          onClick={() => navigate("/home")}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Geri Dön
        </button>
      </div>
    );

  const avgRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <button
        onClick={() => navigate("/home")}
        className="px-3 py-1 bg-white shadow text-orange-600 border rounded mb-5 hover:bg-orange-100"
      >
        ← Geri
      </button>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200">
        {/* Üst bölüm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">

          {/* Ürün görseli */}
          <div>
            <img
              src={product.photo || "https://placehold.co/500x350"}
              className="rounded-xl w-full h-80 object-cover border"
              alt=""
            />
          </div>

          {/* Bilgi alanı */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">{product.name}</h1>

            {/* Fiyat */}
            <p className="text-3xl font-bold text-orange-600 mb-2">{product.price} ₺</p>

            <p className="text-gray-700 mb-4">{product.description}</p>

            {/* Stok */}
            <p className="text-gray-600 mb-2">📦 Stok: {product.quantity} adet</p>

            {/* Satıcı */}
            <div className="bg-orange-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Satıcı</p>
              <p className="font-semibold text-gray-800">
                {seller?.first_name} {seller?.last_name}
              </p>
            </div>

            {/* Sipariş butonları */}
            <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition mt-3">
              🛒 Sipariş Ver
            </button>
          </div>
        </div>

        {/* Yorumlar */}
        <div className="border-t p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ⭐ Yorumlar ({avgRating.toFixed(1)})
          </h2>

          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.review_id} className="bg-gray-50 p-4 rounded-lg mb-3 border">
                <p className="font-semibold">⭐ {r.rating}/5</p>
                <p className="text-gray-600 mt-1">{r.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Henüz yorum yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
