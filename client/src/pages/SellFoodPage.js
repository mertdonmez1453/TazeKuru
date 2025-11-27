import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SellFoodPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    photo: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return navigate("/login");
    setUser(storedUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: user.user_id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          photo: formData.photo || null,
          upload_date: new Date().toISOString().split("T")[0],
          is_available: true,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert("Yemek başarıyla eklendi!");
      navigate("/home");

    } catch (err) {
      alert("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center py-12">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-5">

        <h1 className="text-2xl font-bold text-center">🍽️ Yemek Ekle</h1>

        <input
          type="text" name="name" placeholder="Yemek adı"
          value={formData.name} onChange={handleChange} required
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description" placeholder="Açıklama"
          rows="4" required value={formData.description} onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number" name="price" placeholder="Fiyat (₺)"
          value={formData.price} onChange={handleChange} required
          className="w-full border p-3 rounded"
        />

        <input
          type="number" name="quantity" placeholder="Miktar"
          value={formData.quantity} onChange={handleChange} required
          className="w-full border p-3 rounded"
        />

        <input
          type="url" name="photo" placeholder="Fotoğraf URL"
          value={formData.photo} onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <button type="submit" disabled={loading}
          className="w-full bg-orange-600 text-white p-3 rounded-lg">
          {loading ? "Kaydediliyor..." : "Yemek Ekle"}
        </button>

        <button type="button" onClick={() => navigate("/home")}
          className="w-full bg-gray-200 p-2 rounded-lg">
          İptal
        </button>

      </form>
    </div >
  );
}

export default SellFoodPage;
