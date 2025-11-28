import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate("/home");
    } catch (err) {
      setError(err.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 animate-slideUp">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="text-7xl animate-pulse-slow">🍽️</div>
            </div>
            <h2 className="text-4xl font-extrabold">
              <span className="text-gradient-primary">Hoş Geldiniz</span>
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              Hesabınıza giriş yapın
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-slideDown">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    📧
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern pl-12"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    🔒
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Giriş yapılıyor...</span>
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/signup"
                className="font-medium text-emerald-600 hover:text-emerald-700 text-lg group"
              >
                Hesabınız yok mu?{" "}
                <span className="underline group-hover:no-underline">Kayıt olun →</span>
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

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-400 via-emerald-500 to-lime-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 text-8xl animate-float opacity-30">🥗</div>
        <div className="absolute bottom-32 right-20 text-9xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🍎</div>
        <div className="absolute top-1/3 right-1/4 text-7xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🥦</div>

        <div className="relative z-10 text-white text-center max-w-lg animate-fadeIn">
          <h2 className="text-5xl font-bold mb-6">
            Taze Lezzetler Sizi Bekliyor! 🌟
          </h2>
          <p className="text-xl text-emerald-50 mb-8 leading-relaxed">
            Yerel üreticilerden doğrudan, ev yapımı taze yemeklerin en geniş koleksiyonunu keşfedin.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">✨</div>
              <div className="font-semibold">Premium Kalite</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold">Hızlı Teslimat</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">💚</div>
              <div className="font-semibold">Doğal Ürünler</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-semibold">Güvenilir</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
