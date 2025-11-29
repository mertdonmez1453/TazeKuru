const API_URL = "http://localhost:8081/api";

export const api = {

    //Ürün tagleri için
    tags: {
        list: async () => {
            const res = await fetch(`${API_URL}/tags`);
            return res.json();
        }
    },



    // Auth
    auth: {
        login: async (credentials) => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) throw new Error('Giriş başarısız');
            return response.json();
        },
        signup: async (userData) => {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error('Kayıt başarısız');
            return response.json();
        }
    },

    // Products
    products: {
        addTags: async (productId, tags) => {
            return fetch(`${API_URL}/products/${productId}/tags`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tags })
            }).then(r => r.json());
        },

        list: async (filters = {}) => {
            const params = new URLSearchParams();

            if (filters.seller_id) params.append("seller_id", filters.seller_id);
            if (filters.user_lat) params.append("user_lat", filters.user_lat);
            if (filters.user_lon) params.append("user_lon", filters.user_lon);
            if (filters.tag) params.append("tag", filters.tag);

            const response = await fetch(`${API_URL}/products?` + params.toString());
            return await response.json();
        },
        get: async (id) => {
            const response = await fetch(`${API_URL}/products/${id}`);
            if (!response.ok) throw new Error('Ürün getirilemedi');
            return response.json();
        },
        create: async (productData) => {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!response.ok) throw new Error('Ürün eklenemedi');
            return response.json();
        }
    },

    // Sellers
    sellers: {
        list: async () => {
            const response = await fetch(`${API_URL}/sellers`);
            if (!response.ok) throw new Error('Satıcılar getirilemedi');
            return response.json();
        },
        get: async (id) => {
            const response = await fetch(`${API_URL}/sellers/${id}`);
            if (!response.ok) throw new Error('Satıcı getirilemedi');
            return response.json();
        }
    },

    // Orders
    orders: {
    create: async (orderData) => {
        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error("Sipariş oluşturulamadı");
        return response.json();
    },

    listMyOrders: async (userId) => {
        const response = await fetch(`${API_URL}/orders/my-orders?user_id=${userId}`);
        if (!response.ok) throw new Error("Siparişler getirilemedi");
        return response.json();
    },

    listSellerOrders: async (sellerId) => {
        const res = await fetch(`${API_URL}/orders/seller-orders?seller_id=${sellerId}`);
        if (!res.ok) throw new Error("Satıcı siparişleri getirilemedi");
        return res.json();
    },

    pay: async (orderId) => {
        const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Ödeme işlemi başarısız");
        return response.json();
    },

    updateStatus: async (orderId, status) => {
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Sipariş durumu güncellenemedi");
        return res.json();
    }
},


    // Reviews
    reviews: {
        list: async (productId) => {
            const response = await fetch(`${API_URL}/reviews/${productId}`);
            if (!response.ok) throw new Error('Yorumlar getirilemedi');
            return response.json();
        },
        create: async (reviewData) => {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
            if (!response.ok) throw new Error('Yorum eklenemedi');
            return response.json();
        }
    },

    // Users
    users: {
        update: async (id, userData) => {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error('Kullanıcı güncellenemedi');
            return response.json();
        }
    },

    // Addresses
    addresses: {
        list: async (userId) => {
            const response = await fetch(`${API_URL}/addresses?user_id=${userId}`);
            if (!response.ok) throw new Error('Adresler getirilemedi');
            return response.json();
        },
        create: async (addressData) => {
            const response = await fetch(`${API_URL}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData),
            });
            if (!response.ok) throw new Error('Adres eklenemedi');
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${API_URL}/addresses/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Adres silinemedi');
            return response.json();
        }
    },

    // Cart
    cart: {
        list: async (userId) => {
            const response = await fetch(`${API_URL}/cart?user_id=${userId}`);
            if (!response.ok) throw new Error('Sepet getirilemedi');
            return response.json();
        },
        add: async (cartData) => {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartData),
            });
            if (!response.ok) throw new Error('Sepete eklenemedi');
            return response.json();
        },
        remove: async (id) => {
            const response = await fetch(`${API_URL}/cart/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Sepetten silinemedi');
            return response.json();
        }
    },

    // Messages
    messages: {
        listConversations: async (userId) => {
            const response = await fetch(`${API_URL}/messages/conversations?user_id=${userId}`);
            if (!response.ok) throw new Error('Konuşmalar getirilemedi');
            return response.json();
        },
        listMessages: async (userId, otherUserId) => {
            const response = await fetch(`${API_URL}/messages/${otherUserId}?user_id=${userId}`);
            if (!response.ok) throw new Error('Mesajlar getirilemedi');
            return response.json();
        },
        send: async (messageData) => {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });
            if (!response.ok) throw new Error('Mesaj gönderilemedi');
            return response.json();
        }
    },

    // Notifications
    notifications: {
        list: async (userId) => {
            const response = await fetch(`${API_URL}/notifications?user_id=${userId}`);
            if (!response.ok) throw new Error('Bildirimler getirilemedi');
            return response.json();
        },
        markAsRead: async (id) => {
            const response = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
            });
            if (!response.ok) throw new Error('Güncellenemedi');
            return response.json();
        }
    }
};
