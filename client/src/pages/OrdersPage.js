import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) return navigate("/login");

    setUserData(stored);
    loadOrders(stored.user_id);
  };

  const loadOrders = async (user_id) => {
    try {
      const res = await fetch(`http://localhost:8081/api/orders/${user_id}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Sipariş yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💳 Ödeme işlemi
  const handlePayment = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:8081/api/pay/${orderId}`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) return alert("Ödeme hatası: " + data.error);

      alert("🎉 Ödeme tamamlandı!");
      loadOrders(userData.user_id);
    } catch (error) {
      alert("Ödeme sırasında hata meydana geldi");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        🔄 Siparişler yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-gray-800">🧾 Siparişlerim</h1>
          <button
            onClick={() => navigate("/home")}
            className="text-orange-600 font-semibold"
          >
            ← Ana Sayfa
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-600 text-lg mb-3">Henüz siparişiniz yok</p>
            <button
              onClick={() => navigate("/home")}
              className="bg-orange-600 text-white px-5 py-3 rounded-lg"
            >
              🥗 Yemeklere Göz At
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-xl shadow-md p-6 mb-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-gray-700 font-semibold">
                    Sipariş #{order.order_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tarih: {new Date(order.order_date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <p className="text-xl font-bold text-orange-600">{order.total_price} ₺</p>
              </div>

              {/* Ürünler */}
              <div className="border-t pt-3 space-y-2">
                {order.items?.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={i.photo || "https://placehold.co/60x60"}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <p className="font-medium">
                      {i.name} — {i.quantity} adet × {i.price} ₺
                    </p>
                  </div>
                ))}
              </div>

              {/* Ödeme butonu */}
              {order.status === "pending" && (
                <button
                  onClick={() => handlePayment(order.order_id)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg mt-4"
                >
                  💳 Ödeme Yap
                </button>
              )}

              {order.status === "paid" && (
                <p className="text-green-600 font-semibold mt-3">✔ Ödendi</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
