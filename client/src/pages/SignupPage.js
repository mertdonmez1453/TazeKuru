import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const handleSignup = () => {
    const registration_date = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const rating = 0;
    const loyalty_points = 0;

    axios
      .post("http://localhost:8081/api/signup", {
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email,
        registration_date,
        rating,
        loyalty_points,
      })
      .then((res) => {
        alert(res.data.message);
        navigate("/login");
      })
      .catch((err) => alert("Hata: " + err.response.data.error));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Kayıt Ol</h2>
      <input placeholder="Kullanıcı Adı" onChange={(e) => setUsername(e.target.value)} /> <br /><br />
      <input placeholder="Şifre" type="password" onChange={(e) => setPassword(e.target.value)} /> <br /><br />
      <input placeholder="Ad" onChange={(e) => setFirstName(e.target.value)} /> <br /><br />
      <input placeholder="Soyad" onChange={(e) => setLastName(e.target.value)} /> <br /><br />
      <input placeholder="Telefon Numarası" onChange={(e) => setPhoneNumber(e.target.value)} /> <br /><br />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> <br /><br />
      <button onClick={handleSignup}>Kayıt Ol</button> <br /><br />
      <button onClick={() => navigate("/login")}>Giriş Yap</button>
    </div>
  );
}

export default SignupPage;
