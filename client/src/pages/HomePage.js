import React, { useEffect, useState } from "react";
import axios from "axios";

function HomePage() {
  const [yemekler, setYemekler] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/yemekler")
      .then((res) => setYemekler(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Taze Kuru</h1>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {yemekler.map((yemek) => (
          <li key={yemek.id}>
            <b>{yemek.ad}</b> - {yemek.aciklama} ({yemek.fiyat} ₺)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
