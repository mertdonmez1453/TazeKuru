const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 📦 MongoDB bağlantısı
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB bağlantısı başarılı"))
    .catch((err) => console.log("❌ MongoDB hatası:", err));

// 🧩 Kullanıcı şeması
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// 🧠 Kayıt (Signup)
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Aynı kullanıcı adı var mı kontrol et
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış" });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Kayıt başarılı!" });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
});

// 🔐 Giriş (Login)
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Kullanıcı bulunamadı" });
        }

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Hatalı şifre" });
        }

        res.status(200).json({ message: "Giriş başarılı!" });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
});

// 🌐 Server başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor`));
