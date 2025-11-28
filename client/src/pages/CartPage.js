import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPrice, setTotalPrice] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate("/login");
            return;
        }
        fetchCart(user.user_id);
        fetchAddresses(user.user_id);
    }, [navigate]);

    const fetchCart = async (userId) => {
        try {
            const data = await api.cart.list(userId);
            setCartItems(data);
            calculateTotal(data);
            setLoading(false);
        } catch (err) {
            console.error("Sepet yüklenemedi:", err);
            setLoading(false);
        }
    };

    const fetchAddresses = async (userId) => {
        try {
            const data = await api.addresses.list(userId);
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddressId(data[0].address_id);
            }
        } catch (err) {
            console.error("Adresler yüklenemedi:", err);
        }
    };

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalPrice(total);
    };

    const handleRemoveItem = async (cartId) => {
        if (!window.confirm("Ürünü sepetten çıkarmak istiyor musunuz?")) return;
        try {
            await api.cart.remove(cartId);
            const user = JSON.parse(localStorage.getItem('user'));
            fetchCart(user.user_id);
        } catch (err) {
            alert("Ürün silinemedi: " + err.message);
        }
    };

    const handleCheckout = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (cartItems.length === 0) {
            alert("Sepetiniz boş!");
            return;
        }
        if (!selectedAddressId) {
            alert("Lütfen bir teslimat adresi seçin!");
            return;
        }

        const ordersBySeller = {};
        cartItems.forEach(item => {
            if (!ordersBySeller[item.seller_id]) {
                ordersBySeller[item.seller_id] = { seller_id: item.seller_id, items: [], total: 0 };
            }
            ordersBySeller[item.seller_id].items.push({ product_id: item.product_id, quantity: item.quantity, price: item.price });
            ordersBySeller[item.seller_id].total += item.price * item.quantity;
        });

        try {
            for (const sellerId in ordersBySeller) {
                const orderData = {
                    buyer_id: user.user_id,
                    seller_id: sellerId,
                    total_price: ordersBySeller[sellerId].total,
                    items: ordersBySeller[sellerId].items,
                    address_id: selectedAddressId
                };
                await api.orders.create(orderData);
            }
            for (const item of cartItems) {
                await api.cart.remove(item.cart_id);
            }
            alert("✅ Siparişiniz başarıyla alındı!");
            navigate("/orders");
        } catch (err) {
            alert("Sipariş oluşturulamadı: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-7xl mb-4 animate-pulse-slow">🛒</div>
                    <p className="text-gray-500">Sepetiniz yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient-primary mb-2">Sepetim</h1>
                        <p className="text-gray-600">{cartItems.length} ürün sepetinizde</p>
                    </div>
                    <button
                        onClick={() => navigate("/home")}
                        className="btn-outline"
                    >
                        ← Alışverişe Devam
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="card p-16 text-center animate-fadeIn">
                        <span className="text-9xl mb-6 block animate-pulse-slow">🛒</span>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Sepetiniz Boş</h2>
                        <p className="text-gray-600 mb-8">Henüz sepetinize ürün eklemediniz.</p>
                        <button
                            onClick={() => navigate("/home")}
                            className="btn-primary px-8 py-4"
                        >
                            Alışverişe Başla
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.cart_id} className="card p-6 hover:shadow-xl transition-all group">
                                    <div className="flex items-center gap-6">
                                        {item.photo ? (
                                            <img
                                                src={item.photo}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-xl group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-xl flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                                🍲
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">👨‍🍳 Satıcı: {item.seller_name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="badge-success">📦 {item.quantity} adet</span>
                                                <span className="text-2xl font-bold text-gradient-primary">
                                                    {(item.price * item.quantity).toFixed(2)} ₺
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.cart_id)}
                                            className="p-3 text-2xl hover:bg-red-50 rounded-lg transition"
                                            title="Sepetten Çıkar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Address Selection */}
                            <div className="card p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>📍</span>
                                    <span>Teslimat Adresi</span>
                                </h3>
                                {addresses.length > 0 ? (
                                    <div className="space-y-3 mb-6">
                                        {addresses.map(addr => (
                                            <label
                                                key={addr.address_id}
                                                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId == addr.address_id
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-gray-200 hover:border-emerald-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.address_id}
                                                    checked={selectedAddressId == addr.address_id}
                                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="font-semibold text-gray-800">{addr.city}, {addr.neighbourhood}</div>
                                                <div className="text-sm text-gray-600">{addr.street}</div>
                                                {addr.description && <div className="text-xs text-gray-500 mt-1">{addr.description}</div>}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 mb-6">
                                        <p className="text-gray-500 mb-3">Kayıtlı adres yok</p>
                                        <button
                                            onClick={() => navigate("/profile")}
                                            className="btn-outline"
                                        >
                                            + Adres Ekle
                                        </button>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="border-t-2 border-gray-100 pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sipariş Özeti</h3>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Ürünler ({cartItems.length})</span>
                                            <span>{totalPrice.toFixed(2)} ₺</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Teslimat</span>
                                            <span className="text-emerald-600 font-semibold">Ücretsiz</span>
                                        </div>
                                        <div className="border-t-2 border-gray-100 pt-3 flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-800">Toplam</span>
                                            <span className="text-3xl font-bold text-gradient-primary">{totalPrice.toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="btn-primary w-full text-lg"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <span>Siparişi Tamamla</span>
                                            <span>✅</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;
