import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">
          Taze Kuru
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Ev yapımı lezzetleri keşfedin, satın alın veya satın
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Giriş Yap
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Kayıt Ol
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">Yemek Seç</h3>
            <p className="text-gray-600">
              Ev yapımı lezzetleri keşfedin ve sipariş verin
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Yemek Sat</h3>
            <p className="text-gray-600">
              Kendi yemeklerinizi satın ve para kazanın
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Güvenilir</h3>
            <p className="text-gray-600">
              Güvenilir satıcılardan kaliteli ürünler
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
