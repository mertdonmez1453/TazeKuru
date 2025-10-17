import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <h1>TazeKuru</h1>
            <p>Hoş geldiniz! Lütfen giriş yapın veya kayıt olun.</p>
            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={() => navigate("/login")}>
                    Login
                </button>
                <button style={styles.button} onClick={() => navigate("/signup")}>
                    Signup
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        textAlign: "center",
        marginTop: "100px",
        fontFamily: "Arial, sans-serif",
    },
    buttonContainer: {
        marginTop: "30px",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
    },
    button: {
        padding: "10px 25px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        color: "white",
        fontSize: "16px",
        transition: "0.3s",
    },
};

export default Home;
