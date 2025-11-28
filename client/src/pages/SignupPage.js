import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setLoading(false);
      return;
    }

    try {
      await api.auth.signup({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        role: formData.role
      });

      alert("✅ Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Kayıt olurken bir hata oluştu");
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
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 text-8xl animate-float opacity-30">🌮</div>
        <div className="absolute bottom-32 right-20 text-9xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🍕</div>
        <div className="absolute top-1/3 right-1/4 text-7xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🍜</div>

        <div className="relative z-10 text-white text-center max-w-lg animate-fadeIn">
          <h2 className="text-5xl font-bold mb-6">
            Topluluğumuza Katılın! 👋
          </h2>
          <p className="text-xl text-amber-50 mb-8 leading-relaxed">
            Binlerce lezzetli yemeği keşfedin veya kendi yemeklerinizi satarak gelir elde edin.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <span className="text-4xl">🎯</span>
              <div>
                <div className="font-bold text-lg">Kolay Kayıt</div>
                <div className="text-amber-100 text-sm">Dakikalar içinde başlayın</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <span className="text-4xl">💰</span>
              <div>
                <div className="font-bold text-lg">Ekstra Gelir</div>
                <div className="text-amber-100 text-sm">Yemek satarak kazanın</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <span className="text-4xl">🌟</span>
              <div>
                <div className="font-bold text-lg">Güvenli Platform</div>
                <div className="text-amber-100 text-sm">Verileriniz korumalı</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 py-12 animate-slideUp">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="text-7xl animate-pulse-slow">🍽️</div>
            </div>
            <h2 className="text-4xl font-extrabold">
              <span className="text-gradient-secondary">Kayıt Olun</span>
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              Yeni bir hesap oluşturun
            </p>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-slideDown">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  📧
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Ad"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Soyad"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  📱
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  placeholder="0555 123 45 67"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  🔒
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  placeholder="En az 6 karakter"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  🔐
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  placeholder="Şifreyi tekrar girin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hesap Türü *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer transition-all duration-200 ${formData.role === "customer" ? 'ring-2 ring-emerald-500' : 'ring-1 ring-gray-200'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === "customer"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl text-center ${formData.role === "customer" ? 'bg-emerald-50' : 'bg-white'}`}>
                    <div className="text-4xl mb-2">👤</div>
                    <div className="font-semibold">Müşteri</div>
                    <div className="text-xs text-gray-500">Alışveriş yap</div>
                  </div>
                </label>
                <label className={`cursor-pointer transition-all duration-200 ${formData.role === "seller" ? 'ring-2 ring-amber-500' : 'ring-1 ring-gray-200'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === "seller"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl text-center ${formData.role === "seller" ? 'bg-amber-50' : 'bg-white'}`}>
                    <div className="text-4xl mb-2">👨‍🍳</div>
                    <div className="font-semibold">Satıcı</div>
                    <div className="text-xs text-gray-500">Yemek sat</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full text-lg mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Kayıt yapılıyor...</span>
                </span>
              ) : (
                "Kayıt Ol"
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/login"
                className="font-medium text-amber-600 hover:text-amber-700 text-lg group"
              >
                Zaten hesabınız var mı?{" "}
                <span className="underline group-hover:no-underline">Giriş yapın →</span>
              </Link>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Ana Sayfaya Dön
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
