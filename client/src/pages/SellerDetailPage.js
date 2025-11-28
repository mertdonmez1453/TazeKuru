import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function SellerDetailPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8081/api/seller/${id}`)
      .then(res => res.json())
      .then(data => {
        setSeller(data.seller);
        setProducts(data.products);
      });
  }, [id]);

  if (!seller) return <h2>Yükleniyor...</h2>;

  return (
    <div className="p-6">
      <button onClick={() => navigate("/home")}>← Geri</button>

      <h1 className="text-3xl font-bold mt-3">
        {seller.first_name} {seller.last_name} ⭐{seller.rating || 0}
      </h1>
      <p className="text-gray-500">{seller.email}</p>

      <h2 className="text-2xl mt-6 font-semibold">🍽 Satıcının Yemekleri</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {products.map(p => (
          <div key={p.product_id} 
               onClick={() => navigate(`/product/${p.product_id}`)}
               className="border rounded-xl p-3 cursor-pointer hover:scale-105 duration-200">

            <img src={p.photo || "https://placehold.co/300x200"} 
                 className="w-full h-40 object-cover rounded-md"/>

            <h3 className="font-bold text-lg mt-2">{p.name}</h3>
            <p className="text-gray-500 line-clamp-2">{p.description}</p>

            <p className="mt-2 text-orange-600 font-bold">{p.price} ₺</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerDetailPage;
