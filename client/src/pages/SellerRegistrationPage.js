import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      if (user.role === "seller") {
        // Zaten satıcı ise ana sayfaya yönlendir
        navigate("/home");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userData || !userData.user_id) return;

      // Kullanıcı rolünü 'seller' olarak güncelle
      await api.users.update(userData.user_id, {
        first_name: userData.first_name, // Mevcut bilgileri koru
        last_name: userData.last_name,
        phone_number: formData.phone,
        role: "seller"
      });

      // Local storage güncelle
      const updatedUser = { ...userData, role: "seller", phone_number: formData.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);

      alert(
        "Satıcı başvurunuz alındı! Artık yemek satmaya başlayabilirsiniz."
      );
      navigate("/home");
    } catch (error) {
      console.error("Hata:", error);
      alert("Başvuru yapılırken hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Satıcı Ol
            </h1>
            <p className="text-gray-600">
              Yemeklerinizi satmak için satıcı hesabı oluşturun
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşletme Adı *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Örn: Ev Yapımı Lezzetler"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="İşletmeniz hakkında bilgi verin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0555 123 45 67"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Not:</strong> Başvurunuz onaylandıktan sonra yemek satmaya
                başlayabilirsiniz.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
              >
                {loading ? "Gönderiliyor..." : "Başvuru Yap"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
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
