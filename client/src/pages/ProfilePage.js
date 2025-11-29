import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

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
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    city: "",
    street: "",
    neighbourhood: "",
    description: "",
    latitude: null,
    longitude: null
  });

  const addressInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
      });
      fetchAddresses(user.user_id);
      setLoading(false);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (showAddressForm && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'tr' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          alert("Lütfen listeden bir adres seçin.");
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Adres bileşenlerini ayrıştır
        let city = "";
        let district = "";
        let neighbourhood = "";
        let street = "";
        let route = "";
        let streetNumber = "";

        place.address_components.forEach(component => {
          const types = component.types;
          if (types.includes('administrative_area_level_1')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_2')) {
            district = component.long_name;
          }
          if (types.includes('neighborhood')) {
            neighbourhood = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
        });

        street = `${route} ${streetNumber}`.trim();
        if (!street) street = place.formatted_address.split(',')[0];

        setAddressForm(prev => ({
          ...prev,
          city: city || district,
          neighbourhood: neighbourhood || district,
          street: street,
          latitude: lat,
          longitude: lng,
          description: place.formatted_address // Tam adresi açıklama kısmına koyalım
        }));
      });
    }
  }, [showAddressForm]);

  const fetchAddresses = async (userId) => {
    try {
      const data = await api.addresses.list(userId);
      setAddresses(data);
    } catch (err) {
      console.error("Adresler yüklenemedi:", err);
    }
  };

  const handleSave = async () => {
    try {
      if (!userData || !userData.user_id) return;

      await api.users.update(userData.user_id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number
      });

      const updatedUser = { ...userData, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setEditing(false);
      alert("✅ Profil güncellendi!");
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.latitude || !addressForm.longitude) {
      alert("Lütfen haritadan geçerli bir adres seçin.");
      return;
    }

    try {
      await api.addresses.create({
        user_id: userData.user_id,
        ...addressForm
      });
      alert("✅ Adres eklendi!");
      setShowAddressForm(false);
      setAddressForm({ city: "", street: "", neighbourhood: "", description: "", latitude: null, longitude: null });
      fetchAddresses(userData.user_id);
    } catch (err) {
      alert("Adres eklenemedi: " + err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    try {
      await api.addresses.delete(id);
      fetchAddresses(userData.user_id);
    } catch (err) {
      alert("Adres silinemedi: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-pulse-slow">👤</div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">👤 Profil</h1>
          <p className="text-gray-600">Hesap bilgilerinizi yönetin</p>
        </div>

        {/* Profile Card */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            {/* Avatar & Info */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-lime-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white text-4xl font-bold">
                  {formData.first_name?.[0] || formData.email?.[0] || "👤"}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {formData.first_name} {formData.last_name}
                </h2>
                <p className="text-gray-600 text-lg">{formData.email}</p>
                {userData?.role === "seller" && (
                  <span className="inline-flex items-center gap-2 mt-2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-lime-500 text-white rounded-full text-sm font-semibold">
                    <span>👨‍🍳</span>
                    <span>Satıcı</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {userData?.role === "customer" && !userData?.is_seller_approved && (
                <button
                  onClick={() => navigate("/seller-register")}
                  className="btn-secondary"
                >
                  <span className="flex items-center gap-2">
                    <span>👨‍🍳</span>
                    <span>Satıcı Ol</span>
                  </span>
                </button>
              )}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary"
                >
                  <span className="flex items-center gap-2">
                    <span>✏️</span>
                    <span>Düzenle</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center card-glass p-4">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gradient-primary">
                {Number(userData?.rating ?? 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Puan</div>
            </div>
            <div className="text-center card-glass p-4">
              <div className="text-4xl mb-2">🎁</div>
              <div className="text-2xl font-bold text-gradient-secondary">
                {userData?.loyalty_points || 0}
              </div>
              <div className="text-sm text-gray-600">Sadakat Puanı</div>
            </div>
            {userData?.role === "customer" && (
              <div className="text-center card-glass p-4">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-2xl font-bold text-emerald-600">-</div>
                <div className="text-sm text-gray-600">Sipariş</div>
              </div>
            )}
            {userData?.role === "seller" && (
              <div className="text-center card-glass p-4">
                <div className="text-4xl mb-2">🍽️</div>
                <div className="text-2xl font-bold text-amber-600">-</div>
                <div className="text-sm text-gray-600">Ürün</div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="input-modern"
                />
              ) : (
                <p className="text-gray-800 text-lg">{formData.first_name || "-"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="input-modern"
                />
              ) : (
                <p className="text-gray-800 text-lg">{formData.last_name || "-"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-800 text-lg">{formData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="input-modern"
                />
              ) : (
                <p className="text-gray-800 text-lg">{formData.phone_number || "-"}</p>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {editing && (
            <div className="flex gap-4 mt-6">
              <button onClick={handleSave} className="btn-primary flex-1">
                💾 Kaydet
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    phone_number: userData.phone_number || "",
                    email: userData.email || "",
                  });
                }}
                className="btn-outline flex-1"
              >
                ❌ İptal
              </button>
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>📍</span>
              <span>Adreslerim</span>
            </h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className={showAddressForm ? "btn-outline" : "btn-primary"}
            >
              {showAddressForm ? "İptal" : "+ Yeni Adres Ekle"}
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="card-glass p-6 mb-6 space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adres Ara (Google Maps)</label>
                <input
                  ref={addressInputRef}
                  type="text"
                  placeholder="Adresinizi arayın..."
                  className="input-modern w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Şehir"
                  className="input-modern"
                  value={addressForm.city}
                  onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                  readOnly // Google Maps'ten gelsin
                />
                <input
                  type="text"
                  placeholder="Mahalle"
                  className="input-modern"
                  value={addressForm.neighbourhood}
                  onChange={e => setAddressForm({ ...addressForm, neighbourhood: e.target.value })}
                  required
                  readOnly // Google Maps'ten gelsin
                />
              </div>
              <input
                type="text"
                placeholder="Sokak / Cadde"
                className="input-modern"
                value={addressForm.street}
                onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                required
                readOnly // Google Maps'ten gelsin
              />
              <textarea
                placeholder="Adres Tarifi / Detay (Daire No, Kat vb.)"
                className="input-modern"
                rows="3"
                value={addressForm.description}
                onChange={e => setAddressForm({ ...addressForm, description: e.target.value })}
              />
              <button type="submit" className="btn-primary w-full">
                Kaydet
              </button>
            </form>
          )}

          {/* Address List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.address_id} className="card-glass p-6 relative group hover:shadow-lg transition">
                <button
                  onClick={() => handleDeleteAddress(addr.address_id)}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Sil"
                >
                  🗑️
                </button>
                <div className="mb-2">
                  <span className="text-2xl mr-2">📍</span>
                  <span className="font-bold text-gray-800 text-lg">{addr.city}</span>
                </div>
                <p className="text-gray-700 font-medium">{addr.neighbourhood}</p>
                <p className="text-gray-600">{addr.street}</p>
                {addr.description && (
                  <p className="text-sm text-gray-500 mt-2 italic">{addr.description}</p>
                )}
              </div>
            ))}
            {addresses.length === 0 && !showAddressForm && (
              <div className="col-span-2 text-center py-12">
                <div className="text-7xl mb-4">📍</div>
                <p className="text-gray-500">Henüz kayıtlı adresiniz yok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
