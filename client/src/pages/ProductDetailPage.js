import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ProductDetailPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LocalStorage → user bilgisi alma
  const user = JSON.parse(localStorage.getItem("user"));
  const buyer_id = user?.user_id || null; // giriş yoksa null

  // 📌 Ürün yüklensin
  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/product/${id}`);
      const data = await res.json();
      setProduct(data.product);
      setSeller(data.seller);
    } catch (e) {
      console.log("Ürün çekme hatası:", e);
    }
    setLoading(false);
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/reviews/${id}`);
      const data = await res.json();
      setReviews(data || []);
    } catch (e) {
      console.log("Yorum hata:", e);
    }
  };

  // 🔥 Sipariş ver
  const handleOrder = async () => {
    if (!buyer_id) {
      alert("Sipariş vermek için oturum açmalısın!");
      return navigate("/login");
    }

    const orderData = {
      buyer_id,
      seller_id: product.seller_id,
      product_id: product.product_id,
      price: product.price
    };

    console.log("Gönderilen Sipariş:", orderData);

    const res = await fetch("http://localhost:8081/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const data = await res.json();
    console.log("Sunucu Yanıtı:", data);

    if (res.ok) {
      alert("Sipariş Başarılı ✔");
      navigate("/orders");
    } else {
      alert("Sipariş Oluşturulamadı ❌");
    }
  };

  // 💠 UI Yüklenme ekranı
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-orange-600">
        🍽️ Ürün yükleniyor...
      </div>
    );

  // ❌ Ürün yoksa
  if (!product)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-lg text-gray-500">
        Ürün bulunamadı ❌
        <button onClick={() => navigate("/home")}
        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
          Geri Dön
        </button>
      </div>
    );

  const avgRating = reviews.length === 0
    ? 0
    : reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">

      {/* GERİ DÖN */}
      <button
        onClick={() => navigate("/home")}
        className="px-3 py-1 bg-white shadow text-orange-600 border rounded mb-5 hover:bg-orange-100"
      >
        ← Geri
      </button>


      {/* SAYFA KUTUSU */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200">


        {/* ÜST BÖLÜM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">

          {/* FOTO */}
          <div>
            <img
              src={product.photo || "https://placehold.co/500x350"}
              className="rounded-xl w-full h-80 object-cover border"
              alt="Yemek Görseli"
            />
          </div>


          {/* METİN ALANI */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-orange-600 mb-2">
              {product.price} ₺
            </p>

            <p className="text-gray-700 mb-4">{product.description}</p>

            <p className="text-gray-600 mb-2">📦 Stok: {product.quantity} adet</p>

            {/* SATICI */}
            <div className="bg-orange-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Satıcı</p>
              <p className="font-semibold text-gray-800">
                {seller?.first_name} {seller?.last_name}
              </p>
            </div>


            {/* 🔥 Sipariş */}
            <button
              onClick={handleOrder}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition mt-3"
            >
              🛒 Sipariş Ver
            </button>

          </div>
        </div>




        {/* YORUMLAR BÖLÜMÜ */}
        <div className="border-t p-8">

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ⭐ Yorumlar ({avgRating.toFixed(1)})
          </h2>

          {reviews.length > 0 ? (
            reviews.map(r => (
              <div
                key={r.review_id}
                className="bg-gray-50 p-4 rounded-lg mb-3 border"
              >
                <p className="font-semibold text-orange-600">
                  ⭐ {r.rating} / 5
                </p>
                <p className="text-gray-700 mt-1">{r.comment}</p>
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
