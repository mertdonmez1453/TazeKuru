import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = { username, password };

        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) navigate("/"); // giriş başarılıysa ana sayfaya dön
    };

    return (
        <div style={styles.container}>
            <h2>Login Sayfası</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Kullanıcı adı"
                    style={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" style={styles.button}>
                    Giriş Yap
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { textAlign: "center", marginTop: "100px" },
    form: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" },
    input: { padding: "10px", width: "250px" },
    button: { padding: "10px 20px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "6px" },
};

export default Login;
