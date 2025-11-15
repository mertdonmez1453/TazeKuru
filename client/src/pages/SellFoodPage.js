import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function SellFoodPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    photo: "",
  });
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate("/login");
        return;
      }
      setUser(authUser);

      // Kullanıcı bilgilerini kontrol et
      const { data: userInfo, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .single();

      if (userError) {
        console.error("Kullanıcı bilgisi alınamadı:", userError);
        return;
      }

      setUserData(userInfo);

      if (!userInfo || userInfo.role !== "seller" || !userInfo.is_seller_approved) {
        alert("Yemek satmak için satıcı hesabı gereklidir!");
        navigate("/seller-register");
        return;
      }
    };
    getUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userData || !userData.user_id) {
        throw new Error("Kullanıcı bilgisi bulunamadı. Lütfen sayfayı yenileyin.");
      }

      const { data, error } = await supabase
        .from("product")
        .insert([
          {
            seller_id: userData.user_id,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            photo: formData.photo || null,
            upload_date: new Date().toISOString().split("T")[0],
            is_available: true,
          },
        ])
        .select();

      if (error) {
        console.error("Ürün ekleme hatası:", error);
        throw error;
      }

      console.log("Ürün başarıyla eklendi:", data);

      alert("Yemek başarıyla eklendi!");
      navigate("/home");
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-3xl font-bold text-gray-800">Yemek Sat</h1>
            <p className="text-gray-600 mt-2">Lezzetli yemeklerinizi paylaşın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yemek Adı *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Örn: Ev Yapımı Börek"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Yemeğiniz hakkında detaylı bilgi verin..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotoğraf URL
              </label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Yemeğinizin fotoğrafının URL'sini girin
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Yükleniyor..." : "Yemek Ekle"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
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

export default SellFoodPage;

