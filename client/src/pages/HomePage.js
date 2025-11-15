import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [yemekler, setYemekler] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/yemekler")
      .then((res) => setYemekler(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* Sol kısım: Yemek listesi */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1 style={{ textAlign: "center" }}>Taze Kuru</h1>
        <ul style={{ listStyleType: "none", padding: 0 }}>
        </ul>
      </div>

      {/* Sağ kısım: Slider / yan menü */}
      <div
        style={{
          width: "200px",
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          backgroundColor: "#f0f0f0",
          borderLeft: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "50px",
        }}
      >
        <button
          onClick={() => navigate("/edit-profile")}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          Profil Düzenle
        </button>

        <button
          onClick={() => navigate("/another-page")}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          Başka Sayfa
        </button>

        <button
          onClick={() => navigate("/yet-another-page")}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          Diğer Sayfa
        </button>

        <button
          onClick={() => navigate("/SellFood")}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          Yemek Sat
        </button>
      </div>
    </div>
  );
}

export default HomePage;
