import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

function MyFoodsPage() {
    const [foods, setFoods] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) return navigate("/login");
        loadMyFoods();
    }, []);

    const loadMyFoods = async () => {
        try {
            const data = await api.products.getMyFoods(user.user_id);
            setFoods(data || []);
        } catch (err) {
            console.error("Hata:", err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">🍽️ Yemeklerim</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foods.length > 0 ? foods.map(food => (
                    <div key={food.product_id} className="card p-4 shadow hover:scale-105 transition">
                        <img src={food.photo} className="w-full h-48 object-cover rounded" />
                        <h2 className="text-xl font-bold mt-3">{food.name}</h2>
                        <p className="text-gray-600">{food.description}</p>
                        <p className="text-lg font-bold text-emerald-600 mt-2">{food.price} ₺</p>
                        <p className="text-sm text-gray-400">Stok: {food.quantity}</p>
                    </div>
                )) : (
                    <p className="text-gray-500 text-lg">Henüz bir yemek eklemediniz.</p>
                )}
            </div>
        </div>
    );
}

export default MyFoodsPage;
