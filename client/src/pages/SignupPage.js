import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    axios
      .post("http://localhost:8081/api/signup", { ad, email, sifre })
      .then((res) => {
        alert(res.data.message);
        navigate("/login");
      })
      .catch((err) => alert("Hata: " + err.response.data.error));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Kayıt Ol</h2>
      <input placeholder="Ad" onChange={(e) => setAd(e.target.value)} /> <br /><br />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> <br /><br />
      <input
        placeholder="Şifre"
        type="password"
        onChange={(e) => setSifre(e.target.value)}
      /> <br /><br />
      <button onClick={handleSignup}>Kayıt Ol</button> <br /><br />
      <button onClick={() => navigate("/login")}>Giriş Yap</button>
    </div>
  );
}

export default SignupPage;
