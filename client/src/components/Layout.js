import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

function Layout({ children }) {

    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Navbar görünmeyecek sayfalar
    const noNavbarPages = ["/", "/login", "/signup"];
    const showNavbar = !noNavbarPages.includes(location.pathname);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData(user);
            if (showNavbar) loadNotifications(user.user_id);
        }
    }, [showNavbar]);

    // Bildirimleri çek
    const loadNotifications = async (userId) => {
        try {
            const data = await api.notifications.list(userId);
            setNotifications(data || []);
        } catch (err) {
            console.error("Bildirim hatası:", err);
        }
    };

    // Bildirim okuma
    const handleMarkAsRead = async (id) => {
        try {
            await api.notifications.markAsRead(id);
            loadNotifications(userData.user_id);
        } catch (err) {
            console.error("Okuma hatası:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (!showNavbar) return <>{children}</>;

    return (

        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* 🔥 Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-emerald-100 backdrop-blur-md bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Logo */}
                        <button onClick={() => navigate("/home")} className="flex items-center gap-3 group">
                            <span className="text-5xl group-hover:scale-110 transition">🍽️</span>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-gradient-primary">Taze Kuru</span>
                                <span className="text-xs text-gray-500">Fresh Marketplace</span>
                            </div>
                        </button>

                        {/* Menü */}
                        <div className="hidden md:flex items-center space-x-4">

                            <button onClick={() => navigate("/sell")} className="btn-primary px-4 py-2 text-sm">
                                🍳 Yemek Sat
                            </button>

                            <button onClick={() => navigate("/my-foods")} className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition">
                                🍴 Yemeklerim
                            </button>

                            <button onClick={() => navigate("/home")} className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition">
                                🏠 Ana Sayfa
                            </button>

                            <button onClick={() => navigate("/orders")} className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition">
                                📦 Siparişler
                            </button>

                            <button onClick={() => navigate("/cart")} className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition">
                                🛒 Sepet
                            </button>

                            <button onClick={() => navigate("/messages")} className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition">
                                💬 Mesajlar
                            </button>

                            <button onClick={() => navigate("/profile")} className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition">
                                👤 Profil
                            </button>
                        </div>

                        {/* Sağ panel */}
                        <div className="flex items-center gap-3">

                            {/* Bildirim ikon */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-3 text-2xl hover:bg-emerald-50 rounded-lg transition"
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50">
                                        <div className="p-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-white flex justify-between items-center">
                                            <span className="font-bold">🔔 Bildirimler</span>
                                            <button onClick={() => setShowNotifications(false)} className="hover:bg-white/20 px-2 rounded-xl">✕</button>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map(n => (
                                                <div key={n.notification_id}
                                                     onClick={() => !n.is_read && handleMarkAsRead(n.notification_id)}
                                                     className={`p-4 border-b cursor-pointer transition 
                                                     ${!n.is_read ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                                                    <p className="font-medium">{n.message}</p>
                                                    <p className="text-xs text-gray-500">{new Date(n.created_at).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                            )) : <p className="p-6 text-center text-gray-500">📭 Bildirim yok</p>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Kullanıcı etiketi */}
                            {userData && (
                                <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                                    <span>{userData.role === "seller" ? "👨‍🍳" : "👤"}</span>
                                    <span className="text-sm font-medium text-emerald-700">{userData.first_name}</span>
                                </div>
                            )}

                            {/* Çıkış */}
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow">
                                Çıkış
                            </button>

                        </div>

                    </div>
                </div>
            </nav>

            <div className="flex-1">{children}</div>

        </div>
    );
}

export default Layout;
