import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SellerRegistrationPage() {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }
    setUserData(user);

    if (user.role === "seller") {
      if (user.is_seller_approved) navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:8081/api/seller/apply", {
        user_id: userData.user_id,
        businessName: formData.businessName,
        description: formData.description,
        phone: formData.phone,
      });

      alert("Başvurunuz alındı! Onaydan sonra satış yapabilirsiniz.");

      const updatedUser = {
        ...userData,
        role: "seller",
        phone_number: formData.phone,
        is_seller_approved: 0,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/home");
    } catch (err) {
      console.error("Hata:", err);
      alert("Başvuru yapılırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (userData.role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center">
          <p className="text-gray-600 mb-4">
            {userData.is_seller_approved
              ? "Zaten onaylı bir satıcısınız!"
              : "Satıcı başvurunuz onay bekliyor."}
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-3xl font-bold text-gray-800">
              Satıcı Ol
            </h1>
            <p className="text-gray-600">
              Yemeklerinizi satmak için satıcı hesabı oluşturun
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">
                İşletme Adı *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Örn: Ev Yapımı Lezzetler"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Açıklama
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="İşletmeniz hakkında bilgi verin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telefon Numarası *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="0555 123 45 67"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Not:</strong> Başvurunuz onaylandıktan sonra
                yemek satmaya başlayabilirsiniz.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
              >
                {loading ? "Gönderiliyor..." : "Başvuru Yap"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerRegistrationPage;
