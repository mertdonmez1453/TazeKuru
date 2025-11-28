import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const testimonials = [
    {
      name: "Ayşe Y.",
      role: "Müşteri",
      text: "T azeKuru sayesinde ev yapımı lezzetlere ulaşmak çok kolay! Her sipariş bir başka güzel.",
      rating: 5,
      avatar: "👩"
    },
    {
      name: "Mehmet D.",
      role: "Satıcı",
      text: "Kendi yemeklerimi satarak harika bir ek gelir elde ediyorum. Platform çok kullanıcı dostu!",
      rating: 5,
      avatar: "👨‍🍳"
    },
    {
      name: "Zeynep Ş.",
      role: "Müşteri",
      text: "Organik ve taze ürünler  için ilk tercihim. Satıcılar gerçekten güvenilir.",
      rating: 5,
      avatar: "👩‍💼"
    }
  ];

  const features = [
    {
      icon: "🛒",
      title: "Geniş Ürün Yelpazesi",
      description: "250+ taze yemek seçeneği",
      details: "Ev yemeklerinden tatlılara, çorbalardan hamur işlerine kadar her kategoride binlerce lezzetli ürün",
      color: "emerald"
    },
    {
      icon: "👨‍🍳",
      title: "Güvenilir Satıcılar",
      description: "Doğrulanmış ve puanlı satıcılar",
      details: "Tüm satıcılarımız doğrulama sürecinden geçer ve müşteri yorumlarıyla değerlendirilir",
      color: "amber"
    },
    {
      icon: "⚡",
      title: "Hızlı Teslimat",
      description: "Aynı gün içinde teslim",
      details: "Siparişleriniz aynı gün içinde taze ve güvenli şekilde kapınıza teslim edilir",
      color: "lime"
    },
    {
      icon: "💰",
      title: "Uygun Fiyatlar",
      description: "En iyi fiyat garantisi",
      details: "Aracısız doğrudan satış sayesinde uygun fiyatlarla kaliteli ürünlere ulaşın",
      color: "orange"
    },
    {
      icon: "🌱",
      title: "Organik & Doğal",
      description: "Sağlıklı beslenin",
      details: "Kimyasal katkı maddeleri içermeyen, doğal ve organik ürünler",
      color: "green"
    },
    {
      icon: "⭐",
      title: "Müşteri Memnuniyeti",
      description: "4.8/5 ortalama puan",
      details: "1800+ mutlu müşterimizle Türkiye'nin en beğenilen ev yemekleri platformu",
      color: "yellow"
    }
  ];

  const steps = [
    { icon: "📝", title: "Kayıt Ol", description: "Ücretsiz hesap oluştur" },
    { icon: "🔍", title: "Keşfet", description: "Binlerce ürün ara" },
    { icon: "🛒", title: "Sipariş Ver", description: "Güvenli ödeme yap" },
    { icon: "🥳", title: "Tadını Çıkar", description: "Taze yemeklerin keyfini sür" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen gradient-primary relative overflow-hidden">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🥬</div>
      <div className="absolute top-40 right-20 text-7xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🍅</div>
      <div className="absolute bottom-32 left-1/4 text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🥕</div>
      <div className="absolute bottom-20 right-1/3 text-6xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}>🌽</div>
      <div className="absolute top-1/2 left-1/3 text-4xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🍆</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeIn">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="text-9xl animate-pulse-slow">🍽️</div>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8">
            <span className="text-gradient-primary block mb-2">Taze Kuru</span>
            <span className="text-2xl md:text-3xl text-gray-600 font-medium">
              🌱 Ev Yapımı Lezzetlerin Taze Pazarı
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Yerel üreticilerden <span className="font-bold text-emerald-600">doğrudan</span>, taze ve doğal ürünler.
            <br />Lezzetli yemekleri keşfedin, satın alın veya kendi yemeklerinizi satarak gelir elde edin.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => navigate("/login")} className="btn-primary text-lg px-12 py-5 group">
              <span className="inline-flex items-center gap- 2">
                <span>Giriş Yap</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
            <button onClick={() => navigate("/signup")} className="btn-outline text-lg px-12 py-5 group">
              <span className="inline-flex items-center gap-2">
                <span>Kayıt Ol</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <span>Hızlı Teslimat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span>1800+ Mutlu Müşteri</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Nasıl Çalışır?</h2>
          <p className="text-center text-gray-600 mb-12">4 adımda taze yemeklere ulaşın</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="card-glass p-8 hover:scale-105 transition-transform duration-300">
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-3xl text-emerald-500">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Neden Taze Kuru?</h2>
          <p className="text-center text-gray-600 mb-12">Platform özelliklerimizi keşfedin</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-glass p-8 hover:scale-105 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-4 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-emerald-600 font-semibold mb-2">{feature.description}</p>
                <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${hoveredFeature === index ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                  {feature.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Müşterilerimiz Ne Diyor?</h2>
          <p className="text-center text-gray-600 mb-12">Gerçek kullanıcı deneyimleri</p>
          <div className="max-w-3xl mx-auto">
            <div className="card-glass p-12 text-center relative overflow-hidden">
              <div className="absolute top-6 left-6 text-6xl text-emerald-500/20">"</div>
              <div className="relative z-10 animate-fadeIn" key={activeTestimonial}>
                <div className="text-6xl mb-4">{testimonials[activeTestimonial].avatar}</div>
                <p className="text-xl text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex justify-center mb-3">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <span key={i} className="text-2xl text-yellow-500">⭐</span>
                  ))}
                </div>
                <p className="font-bold text-gray-800 text-lg">{testimonials[activeTestimonial].name}</p>
                <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
              </div>
              <div className="absolute bottom-6 right-6 text-6xl text-emerald-500/20">"</div>
            </div>
            {/* Testimonial Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeTestimonial
                      ? 'bg-emerald-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center card-glass p-8 animate-slideUp">
              <div className="text-5xl font-bold text-gradient-primary mb-2">250+</div>
              <div className="text-gray-600">Taze Ürün</div>
            </div>
            <div className="text-center card-glass p-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold text-gradient-primary mb-2">67+</div>
              <div className="text-gray-600">Yerel Satıcı</div>
            </div>
            <div className="text-center card-glass p-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold text-gradient-primary mb-2">1800+</div>
              <div className="text-gray-600">Mutlu Müşteri</div>
            </div>
            <div className="text-center card-glass p-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl font-bold text-gradient-primary mb-2">4.8⭐</div>
              <div className="text-gray-600">Ortalama Puan</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="card-glass p-16 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Hemen Başlayın!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Taze ve ev yapımı lezzetlerin dünyasına adım atın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/signup")} className="btn-primary text-lg px-12 py-5">
              Ücretsiz Kayıt Ol →
            </button>
            <button onClick={() => navigate("/login")} className="btn-outline text-lg px-12 py-5">
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
