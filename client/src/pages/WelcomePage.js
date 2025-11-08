import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Taze Kuru</h1>
      <p>Hoş geldiniz! Devam etmek için giriş yapın veya kayıt olun.</p>
      <button
        onClick={() => navigate("/login")}
        style={{ margin: "10px", padding: "10px 20px" }}
      >
        Giriş Yap
      </button>
      <button
        onClick={() => navigate("/signup")}
        style={{ margin: "10px", padding: "10px 20px" }}
      >
        Kayıt Ol
      </button>
    </div>
  );
}

export default WelcomePage;
