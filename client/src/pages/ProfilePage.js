import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
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
    loadUser();
  }, []);

const loadUser = async () => {
  const stored = JSON.parse(localStorage.getItem("user"));
  if (!stored) return navigate("/login");

  const res = await fetch("http://localhost:8081/api/get-current-user", {
    headers: { "user-id": stored.user_id }
  });

  const data = await res.json();

  console.log("🔍 BACKENDDEN GELEN VERİ:", data); // <<< EKLEDİK

  if (res.ok && data.user) {
    setUserData(data.user);
    setFormData({
      first_name: data.user.first_name || "",
      last_name: data.user.last_name || "",
      phone_number: data.user.phone_number || "",
      email: data.user.email || "",
    });
  }

  setLoading(false);
};




  const handleSave = async () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) return;

    const res = await fetch("http://localhost:8081/api/update-user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: stored.user_id, ...formData })
    });

    const data = await res.json();

    if (!res.ok) return alert("Hata: " + data.error);

    setEditing(false);
    alert("Profil güncellendi!");
    loadUser();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        🔄 Profil yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-orange-50 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">👤 Profil</h1>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              ✏️ Düzenle
            </button>
          )}
        </div>

        {/* Profil Alanı */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-orange-300 flex items-center justify-center text-3xl font-bold">
            {formData.first_name?.[0] || "👤"}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-gray-600">{formData.email}</p>
          </div>
        </div>

        {/* Bilgiler */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label>Ad</label>
            {editing ? (
              <input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input"
              />
            ) : (
              <p className="text-gray-700">{formData.first_name}</p>
            )}
          </div>

          <div>
            <label>Soyad</label>
            {editing ? (
              <input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input"
              />
            ) : (
              <p className="text-gray-700">{formData.last_name}</p>
            )}
          </div>

          <div>
            <label>Telefon</label>
            {editing ? (
              <input
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="input"
              />
            ) : (
              <p className="text-gray-700">{formData.phone_number || "-"}</p>
            )}
          </div>

          <div>
            <label>Email</label>
            <p className="text-gray-700">{formData.email}</p>
          </div>
        </div>

        {editing && (
          <div className="flex gap-4 mt-8">
            <button onClick={handleSave} className="flex-1 bg-orange-600 text-white py-3 rounded">
              💾 Kaydet
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 bg-gray-200 py-3 rounded">
              ❌ İptal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
