import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    axios
      .post("http://localhost:8081/api/login", { email, sifre })
      .then((res) => {
        alert(res.data.message);
        navigate("/home");
      })
      .catch(() => alert("Hatalı email veya şifre"));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Giriş Yap</h2>
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      /> <br /><br />
      <input
        placeholder="Şifre"
        type="password"
        onChange={(e) => setSifre(e.target.value)}
      /> <br /><br />
      <button onClick={handleLogin}>Giriş Yap</button> <br /><br />
      <button onClick={() => navigate("/signup")}>Kayıt Ol</button>
    </div>
  );
}

export default LoginPage;
