import React, { useState } from "react";
import axios from "axios";

function Signup() {
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");

  const handleSignup = () => {
    axios
      .post("http://localhost:8081/api/signup", { ad, email, sifre })
      .then((res) => alert(res.data.message))
      .catch((err) => alert("Hata: " + err.response.data.error));
  };

  return (
    <div>
      <h2>Kayıt Ol</h2>
      <input placeholder="Ad" onChange={(e) => setAd(e.target.value)} /> <br />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> <br />
      <input placeholder="Şifre" type="password" onChange={(e) => setSifre(e.target.value)} /> <br />
      <button onClick={handleSignup}>Kayıt Ol</button>
    </div>
  );
}

export default Signup;
