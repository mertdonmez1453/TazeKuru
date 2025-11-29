import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    setUserData(user);

    if (user.role !== "seller") {
      // müşteri bu sayfaya gelmesin
      navigate("/home");
      return;
    }

    loadOrders(user.user_id);
  }, [navigate]);

  const loadOrders = async (sellerId) => {
    try {
      setLoading(true);
      const data = await api.orders.listSellerOrders(sellerId);
      setOrders(data || []);
    } catch (err) {
      console.error("Satıcı siparişleri yüklenemedi:", err);
      alert("Siparişler yüklenirken hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    let text = "";
    let style = "";

    switch (status) {
      case "pending":
        text = "Beklemede";
        style = "bg-gray-100 text-gray-700";
        break;
      case "preparing":
        text = "Hazırlanıyor";
        style = "bg-yellow-100 text-yellow-800";
        break;
      case "delivered":
        text = "Teslim Edildi";
        style = "bg-emerald-100 text-emerald-800";
        break;
      default:
        text = status || "Bilinmiyor";
        style = "bg-gray-100 text-gray-700";
    }

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${style}`}>
        {text}
      </span>
    );
  };

  const handleStatusChange = async (order, newStatus) => {
    if (!userData) return;

    const confirmText =
      newStatus === "preparing"
        ? "Bu siparişi 'Hazırlanıyor' olarak işaretlemek istediğine emin misin?"
        : "Bu siparişi 'Teslim edildi' olarak işaretlemek istediğine emin misin?";

    if (!window.confirm(confirmText)) return;

    try {
      setUpdatingId(order.order_id);
      await api.orders.updateStatus(order.order_id, newStatus);
      alert("Sipariş durumu güncellendi. Müşteriye bildirim gönderildi.");
      loadOrders(userData.user_id);
    } catch (err) {
      console.error("Durum güncellenemedi:", err);
      alert("Durum güncellenemedi: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-pulse-slow">📦</div>
          <p className="text-gray-500">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-1">
              📥 Gelen Siparişler
            </h1>
            <p className="text-gray-600">
              Müşterilerden gelen siparişleri buradan yönetebilirsin.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-8xl mb-4 block">📭</span>
            <p className="text-gray-500 text-lg">
              Henüz hiç siparişin yok.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="card p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">📋</span>
                      <span className="text-sm text-gray-500">
                        Sipariş #{order.order_id}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      🧑‍🧑‍🧒 Müşteri:{" "}
                      {order.buyer_name} {order.buyer_lastname}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span>📅</span>
                      <span>
                        {order.order_date &&
                          new Date(order.order_date).toLocaleDateString("tr-TR")}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gradient-primary mb-2">
                      {Number(order.total_price || 0).toFixed(2)} ₺
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <p className="text-sm text-gray-500 italic">
                    Sipariş durumu değiştiğinde müşteriye otomatik bildirim gönderilir.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      disabled={
                        updatingId === order.order_id ||
                        order.status === "preparing" ||
                        order.status === "delivered"
                      }
                      onClick={() => handleStatusChange(order, "preparing")}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingId === order.order_id && order.status !== "preparing"
                        ? "Güncelleniyor..."
                        : "Hazırlandı"}
                    </button>
                    <button
                      disabled={
                        updatingId === order.order_id ||
                        order.status === "delivered"
                      }
                      onClick={() => handleStatusChange(order, "delivered")}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingId === order.order_id && order.status !== "delivered"
                        ? "Güncelleniyor..."
                        : "Teslim Edildi"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOrdersPage;
