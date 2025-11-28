const API_URL = "http://localhost:8081/api";

export const api = {

    // ================= AUTH ================= //
    auth: {
        login: async (credentials) => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) throw new Error("Giriş başarısız");
            return response.json();
        },

        signup: async (userData) => {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error("Kayıt başarısız");
            return response.json();
        },
    },

    // ================= PRODUCTS ================= //
    products: {

        // Tüm ürünleri listele
        list: async (filters = {}) => {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/products?${query}`);
            if (!response.ok) throw new Error("Ürünler getirilemedi");
            return response.json();
        },

        // Tek ürün getir
        get: async (id) => {
            const response = await fetch(`${API_URL}/products/${id}`);
            if (!response.ok) throw new Error("Ürün bulunamadı");
            return response.json();
        },

        // Yeni ürün ekle (YEMEK EKLEME)
        create: async (data) => {
            const response = await fetch(`${API_URL}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Ürün ekleme başarısız");
            return response.json();
        },

        // 🔥 Kullanıcının yüklediği yemekleri çek
        getMyFoods: async (user_id) => {
            const response = await fetch(`${API_URL}/products/mine/${user_id}`);
            if (!response.ok) throw new Error("Kendi yemeklerin getirilemedi");
            return response.json();
        },
    },

    // ================= SELLERS ================= //
    sellers: {
        list: async () => {
            const response = await fetch(`${API_URL}/sellers`);
            if (!response.ok) throw new Error("Satıcılar getirilemedi");
            return response.json();
        },

        get: async (id) => {
            const response = await fetch(`${API_URL}/sellers/${id}`);
            if (!response.ok) throw new Error("Satıcı bulunamadı");
            return response.json();
        },
    },

    // ================= ORDERS ================= //
    orders: {
        create: async (data) => {
            const response = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Sipariş oluşturulamadı");
            return response.json();
        },

        listMyOrders: async (userId) => {
            const response = await fetch(`${API_URL}/orders/my-orders?user_id=${userId}`);
            if (!response.ok) throw new Error("Siparişler bulunamadı");
            return response.json();
        },

        pay: async (orderId) => {
            const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
                method: "PUT",
            });
            if (!response.ok) throw new Error("Ödeme başarısız");
            return response.json();
        },
    },

    // ================= REVIEWS ================= //
    reviews: {
        list: async (productId) => {
            const response = await fetch(`${API_URL}/reviews/${productId}`);
            if (!response.ok) throw new Error("Yorumlar bulunamadı");
            return response.json();
        },

        create: async (reviewData) => {
            const response = await fetch(`${API_URL}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData),
            });
            if (!response.ok) throw new Error("Yorum eklenemedi");
            return response.json();
        },
    },

    // ================= USERS ================= //
    users: {
        update: async (id, data) => {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Kullanıcı güncellenemedi");
            return response.json();
        },
    },

    // ================= ADDRESSES ================= //
    addresses: {
        list: async (userId) => {
            const response = await fetch(`${API_URL}/addresses?user_id=${userId}`);
            if (!response.ok) throw new Error("Adres listesi alınamadı");
            return response.json();
        },

        create: async (data) => {
            const response = await fetch(`${API_URL}/addresses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Adres eklenemedi");
            return response.json();
        },

        delete: async (id) => {
            const response = await fetch(`${API_URL}/addresses/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Adres silinemedi");
            return response.json();
        },
    },

    // ================= CART ================= //
    cart: {
        list: async (userId) => {
            const response = await fetch(`${API_URL}/cart?user_id=${userId}`);
            if (!response.ok) throw new Error("Sepet alınamadı");
            return response.json();
        },

        add: async (data) => {
            const response = await fetch(`${API_URL}/cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Sepete eklenemedi");
            return response.json();
        },

        remove: async (id) => {
            const response = await fetch(`${API_URL}/cart/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Silinemedi");
            return response.json();
        },
    },

    // ================= MESSAGES ================= //
    messages: {
        listConversations: async (userId) => {
            const response = await fetch(`${API_URL}/messages/conversations?user_id=${userId}`);
            if (!response.ok) throw new Error("Konuşmalar alınamadı");
            return response.json();
        },

        listMessages: async (userId, otherUserId) => {
            const response = await fetch(`${API_URL}/messages/${otherUserId}?user_id=${userId}`);
            if (!response.ok) throw new Error("Mesajlar alınamadı");
            return response.json();
        },

        send: async (msg) => {
            const response = await fetch(`${API_URL}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(msg),
            });
            if (!response.ok) throw new Error("Mesaj gönderilemedi");
            return response.json();
        },
    },

    // ================= NOTIFICATIONS ================= //
    notifications: {
        list: async (userId) => {
            const response = await fetch(`${API_URL}/notifications?user_id=${userId}`);
            if (!response.ok) throw new Error("Bildirimler alınamadı");
            return response.json();
        },

        markAsRead: async (id) => {
            const response = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: "PUT",
            });
            if (!response.ok) throw new Error("Okundu yapılamadı");
            return response.json();
        },
    },

}
