import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: userInfo } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();
      setUserData(userInfo);

      // Siparişleri yükle
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          *,
          seller:users!orders_seller_id_fkey(first_name, last_name),
          items:order_items(*, product:product(name, photo))
        `)
        .eq("buyer_id", userInfo.user_id)
        .order("order_date", { ascending: false });

      setOrders(ordersData || []);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId) => {
    try {
      // Ödeme kaydı oluştur
      await supabase.from("payment").insert([
        {
          order_id: orderId,
          user_id: userData.user_id,
          method: "credit_card",
          payment_date: new Date().toISOString().split("T")[0],
        },
      ]);

      // Sipariş durumunu güncelle
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("order_id", orderId);

      alert("Ödeme başarıyla tamamlandı!");
      loadData();
    } catch (error) {
      console.error("Ödeme hatası:", error);
      alert("Ödeme yapılırken hata: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Siparişlerim</h1>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 text-orange-600 hover:text-orange-700"
          >
            ← Ana Sayfa
          </button>
        </div>

        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Sipariş #{order.order_id}</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {order.seller?.first_name} {order.seller?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.order_date).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      {order.total_price} ₺
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status === "paid"
                        ? "Ödendi"
                        : order.status === "pending"
                        ? "Beklemede"
                        : order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {order.items?.map((item) => (
                    <div key={item.order_item_id} className="flex items-center space-x-4 mb-2">
                      {item.product?.photo && (
                        <img
                          src={item.product.photo}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} adet × {item.price} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePayment(order.order_id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                    >
                      💳 Ödeme Yap
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">Henüz siparişiniz yok</p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Yemeklere Göz At
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;

