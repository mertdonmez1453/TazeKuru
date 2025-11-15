import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate("/login");
        return;
      }

      setUser(authUser);

      // Kullanıcı bilgilerini veritabanından al
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .single();

      if (data) {
        setUserData(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          email: data.email || authUser.email || "",
        });
      }
      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  const handleSave = async () => {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", user.email)
        .single();

      if (existingUser) {
        // Güncelle
        const { error } = await supabase
          .from("users")
          .update(formData)
          .eq("user_id", existingUser.user_id);

        if (error) throw error;
      }

      setEditing(false);
      alert("Profil güncellendi!");
      window.location.reload();
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              👤 Profil
            </h1>
            <div className="flex space-x-2">
              {userData?.role === "customer" && !userData?.is_seller_approved && (
                <button
                  onClick={() => navigate("/seller-register")}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  👨‍🍳 Satıcı Ol
                </button>
              )}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  ✏️ Düzenle
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Profil Fotoğrafı */}
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center border-4 border-orange-300">
                <span className="text-orange-700 text-3xl font-semibold">
                  {formData.first_name?.[0] || formData.email?.[0] || "👤"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {formData.first_name} {formData.last_name}
                </h2>
                <p className="text-gray-600">{formData.email}</p>
                {userData?.role === "seller" && (
                  <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    👨‍🍳 Satıcı
                  </span>
                )}
              </div>
            </div>

            {/* Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-800">{formData.first_name || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-800">{formData.last_name || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-800">{formData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-800">{formData.phone_number || "-"}</p>
                )}
              </div>
            </div>

            {/* İstatistikler */}
            {userData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-orange-200">
                <div className="text-center bg-orange-50 rounded-lg p-4">
                  <p className="text-3xl mb-2">⭐</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {userData.rating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-sm text-gray-600">Puan</p>
                </div>
                <div className="text-center bg-amber-50 rounded-lg p-4">
                  <p className="text-3xl mb-2">🎁</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {userData.loyalty_points || 0}
                  </p>
                  <p className="text-sm text-gray-600">Sadakat Puanı</p>
                </div>
                {userData.role === "customer" && (
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <p className="text-3xl mb-2">📦</p>
                    <p className="text-2xl font-bold text-green-600">-</p>
                    <p className="text-sm text-gray-600">Sipariş</p>
                  </div>
                )}
                {userData.role === "seller" && (
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <p className="text-3xl mb-2">🍽️</p>
                    <p className="text-2xl font-bold text-blue-600">-</p>
                    <p className="text-sm text-gray-600">Ürün</p>
                  </div>
                )}
              </div>
            )}

            {/* Butonlar */}
            {editing && (
              <div className="flex space-x-4 pt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition"
                >
                  💾 Kaydet
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    window.location.reload();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  ❌ İptal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

