import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function SellerDetailPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("message"); // message | review
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8081/api/seller/${id}`)
      .then(res => res.json())
      .then(data => {
        setSeller(data.seller);
        setProducts(data.products);
      });
  }, [id]);

  if (!seller)
    return <div className="text-center p-10 text-xl">🔄 Yükleniyor...</div>;

  // 🟠 Mesaj Gönder
  const sendMessage = async () => {
    if (!user) return alert("Giriş yapmalısın!");
    if (!message.trim()) return alert("Mesaj boş olamaz!");

    const res = await fetch("http://localhost:8081/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: user.user_id,
        receiver_id: seller.user_id,
        message_text: message
      })
    });

    if (res.ok) {
      alert("Mesaj gönderildi ✔");
      setMessage("");
    } else alert("Mesaj gönderilemedi ❌");
  };

  // ⭐ Yorum Gönder
  const sendReview = async () => {
    if (!user) return alert("Giriş yapmalısın!");
    if (!comment.trim()) return alert("Yorum boş olamaz!");

    const res = await fetch("http://localhost:8081/api/add-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller_id: seller.user_id,
        rating,
        comment,
        user_id: user.user_id
      })
    });

    if (res.ok) {
      alert("Yorum gönderildi ✔");
      setComment("");
    } else alert("Yorum gönderilemedi ❌");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">

      <button onClick={() => navigate("/home")} className="px-4 py-2 bg-white shadow rounded hover:bg-orange-100">
        ← Geri
      </button>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-xl mt-6 border-l-4 border-orange-500">
        <h1 className="text-4xl font-bold">{seller.first_name} {seller.last_name}</h1>
        <p className="text-gray-500">{seller.email}</p>
        <p className="mt-2 text-orange-600 text-xl">⭐ {seller.rating || 0}</p>
      </div>

      <h2 className="text-3xl font-bold mt-10 text-center">🍽 Satıcı Ürünleri</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 max-w-5xl mx-auto">
        {products.map(p => (
          <div key={p.product_id}
            onClick={() => navigate(`/product/${p.product_id}`)}
            className="p-3 bg-white rounded-xl shadow hover:scale-[1.05] cursor-pointer transition"
          >
            <img src={p.photo || "https://placehold.co/300x200"}
                 className="h-44 w-full rounded-lg object-cover" />
            <h3 className="font-bold text-xl mt-2">{p.name}</h3>
            <p className="line-clamp-2 text-gray-600">{p.description}</p>
            <p className="text-orange-600 font-bold mt-1">{p.price} ₺</p>
          </div>
        ))}
      </div>

      {/* 🟠 MESAJ & YORUM SEKMESİ */}
      <div className="max-w-3xl mx-auto bg-white p-6 mt-12 rounded-xl shadow-lg">
        <div className="flex gap-4 border-b pb-2 mb-4">
          <button className={tab==="message"?"font-bold text-orange-600":"text-gray-500"}
                  onClick={()=>setTab("message")}>
            💬 Mesaj Gönder
          </button>
          <button className={tab==="review"?"font-bold text-orange-600":"text-gray-500"}
                  onClick={()=>setTab("review")}>
            ⭐ Yorum Yap
          </button>
        </div>

        {tab==="message" && (
          <div>
            <textarea
              value={message}
              onChange={e=>setMessage(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Mesaj yaz..."
            />
            <button onClick={sendMessage}
                    className="mt-3 bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700">
              Gönder
            </button>
          </div>
        )}

        {tab==="review" && (
          <div>
            <label className="font-semibold">Puan:</label>
            <select value={rating} onChange={e=>setRating(e.target.value)} className="border p-2 rounded ml-2">
              <option value="5">⭐⭐⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="2">⭐⭐</option>
              <option value="1">⭐</option>
            </select>

            <textarea
              value={comment}
              onChange={e=>setComment(e.target.value)}
              className="w-full border p-3 rounded-lg mt-3"
              placeholder="Yorum yaz..."
            />

            <button onClick={sendReview}
                    className="mt-3 bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700">
              Gönder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDetailPage;
