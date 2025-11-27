import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8081/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Giriş yapılamadı.");

      // kullanıcı bilgisini localStorage'da tut
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-primary-50">

      <form onSubmit={handleLogin} className="p-8 bg-white shadow rounded-lg w-96 space-y-5">

        <h2 className="text-center text-2xl font-semibold">Giriş Yap</h2>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</p>}

        <input
          type="text"
          placeholder="Kullanıcı adı"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          type="password"
          placeholder="Şifre"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <button disabled={loading} className="w-full bg-primary-600 text-white p-3 rounded">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <p className="text-center text-sm">
          Hesabın yok mu? → <Link to="/signup" className="text-primary-600">Kayıt Ol</Link>
        </p>

      </form>
    </div>
  );
}

export default LoginPage;
