import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    axios
      .post("http://localhost:8081/api/login", { username, password })
      .then((res) => {
        alert(res.data.message);
        navigate("/home");
      })
      .catch(() => alert("Hatalı kullanıcı adı veya şifre"));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Giriş Yap</h2>
      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      /> <br /><br />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      /> <br /><br />
      <button onClick={handleLogin}>Giriş Yap</button> <br /><br />
      <button onClick={() => navigate("/signup")}>Kayıt Ol</button>
    </div>
  );
}

export default LoginPage;
