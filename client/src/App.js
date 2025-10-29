import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [yemekler, setYemekler] = useState([]);
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/yemekler")
      .then((res) => setYemekler(res.data))
      .catch((err) => console.log(err));
  }, []);

  // SIGNUP
  const handleSignup = () => {
    axios
      .post("http://localhost:8081/api/signup", { ad, email, sifre })
      .then((res) => alert(res.data.message))
      .catch((err) => alert("Hata: " + err.response.data.error));
  };

  // LOGIN
  const handleLogin = () => {
    axios
      .post("http://localhost:8081/api/login", { email, sifre })
      .then((res) => alert(res.data.message))
      .catch(() => alert("Hatalı email veya şifre"));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Ev Yemekleri</h1>
      <ul>
        {yemekler.map((yemek) => (
          <li key={yemek.id}>
            <b>{yemek.ad}</b> - {yemek.aciklama} ({yemek.fiyat} ₺)
          </li>
        ))}
      </ul>

      <hr />

      <h2>Kayıt Ol (Signup)</h2>
      <input placeholder="Ad" onChange={(e) => setAd(e.target.value)} /> <br />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> <br />
      <input placeholder="Şifre" type="password" onChange={(e) => setSifre(e.target.value)} /> <br />
      <button onClick={handleSignup}>Kayıt Ol</button>

      <hr />

      <h2>Giriş Yap (Login)</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> <br />
      <input placeholder="Şifre" type="password" onChange={(e) => setSifre(e.target.value)} /> <br />
      <button onClick={handleLogin}>Giriş Yap</button>
    </div>
  );
}

export default App;
