import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState(null);
  const [productId, setProductId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);

      const sellerId = searchParams.get("seller");
      const prodId = searchParams.get("product");
      if (sellerId) setReceiverId(parseInt(sellerId));
      if (prodId) setProductId(parseInt(prodId));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (userData) {
      loadConversations();
      if (receiverId) {
        loadMessages(receiverId);
        setSelectedConversation(receiverId);
      }
    }
  }, [userData, receiverId]);

  useEffect(() => {
    let interval;
    if (selectedConversation) {
      loadMessages(selectedConversation);
      interval = setInterval(() => {
        loadMessages(selectedConversation);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      if (!userData) return;
      const data = await api.messages.listConversations(userData.user_id);

      const convMap = new Map();
      data?.forEach((msg) => {
        const otherUserId =
          msg.sender_id === userData.user_id ? msg.receiver_id : msg.sender_id;

        const otherUser = {
          user_id: otherUserId,
          first_name: msg.sender_id === userData.user_id ? msg.receiver_first_name : msg.sender_first_name,
          last_name: msg.sender_id === userData.user_id ? msg.receiver_last_name : msg.sender_last_name,
        };

        if (!convMap.has(otherUserId)) {
          convMap.set(otherUserId, {
            userId: otherUserId,
            user: otherUser,
            lastMessage: msg,
            unread: msg.receiver_id === userData.user_id && !msg.is_read,
          });
        } else {
          const conv = convMap.get(otherUserId);
          if (new Date(msg.sent_at) > new Date(conv.lastMessage.sent_at)) {
            conv.lastMessage = msg;
            conv.unread = msg.receiver_id === userData.user_id && !msg.is_read;
          }
        }
      });

      setConversations(Array.from(convMap.values()));
    } catch (error) {
      console.error("Konuşmalar yüklenirken hata:", error);
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      if (!userData) return;
      const data = await api.messages.listMessages(userData.user_id, otherUserId);
      setMessages(data || []);
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.messages.send({
        sender_id: userData.user_id,
        receiver_id: selectedConversation,
        product_id: productId,
        message_text: newMessage,
      });

      setNewMessage("");
      loadMessages(selectedConversation);
      loadConversations();
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      alert("Mesaj gönderilemedi: " + error.message);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-pulse-slow">💬</div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">💬 Mesajlar</h1>
          <p className="text-gray-600">Satıcılar ve müşterilerle iletişim</p>
        </div>

        <div className="card overflow-hidden h-[calc(100vh-16rem)] flex">
          {/* Left: Conversations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-lime-50">
              <h2 className="text-lg font-bold text-gray-800">Konuşmalar</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => {
                      setSelectedConversation(conv.userId);
                      setReceiverId(conv.userId);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-emerald-50 transition ${selectedConversation === conv.userId ? "bg-emerald-50" : ""
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {conv.user.first_name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {conv.user.first_name} {conv.user.last_name}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-[150px]">
                            {conv.lastMessage.message_text}
                          </p>
                        </div>
                      </div>
                      {conv.unread && (
                        <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-6xl mb-4">📭</div>
                  <p>Henüz mesajınız yok</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Messages */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-lime-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conversations.find((c) => c.userId === selectedConversation)?.user.first_name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {conversations.find((c) => c.userId === selectedConversation)?.user.first_name}{" "}
                        {conversations.find((c) => c.userId === selectedConversation)?.user.last_name}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${msg.sender_id === userData.user_id ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.sender_id === userData.user_id
                            ? "bg-gradient-to-r from-emerald-500 to-lime-500 text-white"
                            : "bg-white text-gray-800 shadow-md"
                          }`}
                      >
                        <p className="text-sm">{msg.message_text}</p>
                        <p
                          className={`text-xs mt-1 ${msg.sender_id === userData.user_id ? "text-emerald-100" : "text-gray-500"
                            }`}
                        >
                          {new Date(msg.sent_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesaj yazın..."
                      className="input-modern flex-1"
                    />
                    <button type="submit" className="btn-primary px-8">
                      Gönder →
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-8xl mb-4 animate-pulse-slow">💬</div>
                <p className="text-xl">Bir konuşma seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
