import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function SellFoodPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    photo: "",
  });

  const [allTags, setAllTags] = useState([]);        // 🔥 Tüm tagler
  const [selectedTags, setSelectedTags] = useState([]); // 🔥 Seçili tagler

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kullanıcı + Tagleri Yükle
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    const user = JSON.parse(storedUser);
    setUserData(user);

    // 🔥 TAGLERİ YÜKLE
    api.tags.list().then(setAllTags);
  }, []);

  // Tag seçme toggle
  const toggleTag = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userData?.user_id) throw new Error("Kullanıcı bulunamadı!");

      // 1️⃣ ÜRÜNÜ OLUŞTUR
      const created = await api.products.create({
        seller_id: userData.user_id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        photo: formData.photo || null,
      });

      const productId = created.product_id;
      if (!productId) throw new Error("Ürün ID alınamadı!");

      // 2️⃣ SEÇİLEN TAGLERİ EKLE
      if (selectedTags.length > 0) {
        await api.products.addTags(productId, selectedTags);
      }

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
            
            {/* Yemek adı */}
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
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2"
                placeholder="Ev Yapımı Su Böreği"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2"
                placeholder="Tereyağlı ev yapımı su böreği..."
              />
            </div>

            {/* Fiyat & Miktar */}
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
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2"
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
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2"
                />
              </div>
            </div>

            {/* Fotoğraf */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotoğraf URL
              </label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2"
              />
            </div>

            {/* 🔥 TAG SEÇİMİ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kategoriler / Tagler
              </label>

              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <button
                    key={t.tag_id}
                    type="button"
                    onClick={() => toggleTag(t.tag_name)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      selectedTags.includes(t.tag_name)
                        ? "bg-orange-500 text-white border-orange-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t.tag_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
              >
                {loading ? "Yükleniyor..." : "Yemek Ekle"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
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
