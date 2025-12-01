import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({}); // 🔥 Sipariş ürünlerini sakla
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      loadData(user.user_id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadData = async (userId) => {
    try {
      setLoading(true);
      const ordersData = await api.orders.listMyOrders(userId);
      setOrders(ordersData || []);

      // 🔥 Her sipariş için ürünleri yükle
      const itemsData = {};
      for (const order of ordersData || []) {
        const items = await api.orders.getOrderItems(order.order_id);
        itemsData[order.order_id] = items;
      }
      setOrderItems(itemsData);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId) => {
    try {
      await api.orders.pay(orderId);
      setShowSuccessModal(true);
      if (userData) {
        await loadData(userData.user_id);
      }
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Ödeme işlemi başarısız: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "Beklemede", class: "badge-warning", icon: "⏳" },
      preparing: { label: "Hazırlanıyor", class: "badge-success", icon: "👨‍🍳" },
      on_the_way: { label: "Yolda", class: "badge-success", icon: "🚚" },
      paid: { label: "Ödendi", class: "badge-success", icon: "✅" },
      delivered: { label: "Teslim Edildi", class: "badge-success", icon: "📦" },
      cancelled: { label: "İptal Edildi", class: "badge-error", icon: "❌" },
    };
    const statusInfo = statuses[status] || { label: status, class: "bg-gray-100 text-gray-700", icon: "📋" };
    return (
      <span className={`${statusInfo.class} inline-flex items-center gap-1`}>
        <span>{statusInfo.icon}</span>
        <span>{statusInfo.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-pulse-slow">📦</div>
          <p className="text-gray-500">Siparişleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">Siparişlerim</h1>
            <p className="text-gray-600">{orders.length} sipariş bulundu</p>
          </div>
        </div>

        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.order_id} className="card p-6 hover:shadow-2xl transition-all animate-fadeIn">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📋</span>
                      <span className="text-sm text-gray-500">Sipariş #{order.order_id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      👨‍🍳 {order.seller_name} {order.seller_lastname}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span>📅</span>
                      <span>{new Date(order.order_date).toLocaleDateString("tr-TR")}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gradient-primary mb-2">
                      {Number(order.total_price || 0).toFixed(2)} ₺
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* 🔥 Siparişteki Ürünler */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Sipariş İçeriği:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {orderItems[order.order_id]?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => navigate(`/product/${item.product_id}`)}
                        className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-emerald-50 transition cursor-pointer group"
                      >
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate group-hover:text-emerald-600 transition">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                          <p className="text-sm font-bold text-emerald-600">
                            {(Number(item.price) * Number(item.quantity)).toFixed(2)} ₺
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handlePayment(order.order_id)}
                      className="btn-primary w-full md:w-auto"
                    >
                      <span className="flex items-center gap-2">
                        <span>💳</span>
                        <span>Ödeme Yap</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card p-16 text-center animate-fadeIn">
              <span className="text-9xl mb-6 block animate-pulse-slow">📦</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Henüz Sipariş Yok</h2>
              <p className="text-gray-600 mb-8">İlk siparişinizi vermek için alışverişe başlayın!</p>
              <button
                onClick={() => navigate("/home")}
                className="btn-primary px-8 py-4"
              >
                Yemeklere Göz At
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="card max-w-md w-full p-8 text-center animate-scaleIn">
            <div className="text-8xl mb-4 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold text-gradient-primary mb-4">Ödeme Başarılı!</h2>
            <p className="text-xl text-gray-700 mb-2">Siparişiniz Hazırlanıyor!</p>
            <p className="text-gray-600">Satıcınız siparişinizi hazırlıyor...</p>
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-lime-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;