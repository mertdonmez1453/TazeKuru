import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor"); setLoading(false); return;
    } 

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalı"); setLoading(false); return;
    }

    try {
      const res = await fetch("http://localhost:8081/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.email.split("@")[0],
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          email: formData.email,
          registration_date: new Date().toISOString().split("T")[0],
          rating: 0,
          loyalty_points: 0,
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Kayıt başarılı!");
      navigate("/login");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-primary-50">

      <form onSubmit={handleSignup} className="p-8 bg-white shadow w-96 rounded space-y-5">

        <h2 className="text-center text-2xl font-bold">Kayıt Ol</h2>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</p>}

        <input name="email" type="email" required placeholder="Email"
          value={formData.email} onChange={handleChange} className="w-full border p-3 rounded" />

        <input name="first_name" type="text" placeholder="Ad"
          value={formData.first_name} onChange={handleChange} className="w-full border p-3 rounded" />

        <input name="last_name" type="text" placeholder="Soyad"
          value={formData.last_name} onChange={handleChange} className="w-full border p-3 rounded" />

        <input name="phone_number" type="tel" placeholder="Telefon"
          value={formData.phone_number} onChange={handleChange} className="w-full border p-3 rounded" />

        <input name="password" type="password" required placeholder="Şifre"
          value={formData.password} onChange={handleChange} className="w-full border p-3 rounded" />

        <input name="confirmPassword" type="password" required placeholder="Şifre Tekrar"
          value={formData.confirmPassword} onChange={handleChange} className="w-full border p-3 rounded" />

        <button disabled={loading} className="w-full bg-primary-600 text-white p-3 rounded">
          {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </button>

        <p className="text-center text-sm">
          Hesabın var mı? → <Link to="/login" className="text-primary-600">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
