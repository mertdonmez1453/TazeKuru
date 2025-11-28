import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState(null);
  const [productId, setProductId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);

    const sellerId = searchParams.get("seller");
    const prodId = searchParams.get("product");

    if (sellerId) setReceiverId(parseInt(sellerId, 10));
    if (prodId) setProductId(parseInt(prodId, 10));
  }, [navigate, searchParams]);

  useEffect(() => {
    if (user) loadConversations();
    if (user && receiverId) {
      loadMessages(receiverId);
      setSelectedConversation(receiverId);
    }
  }, [user, receiverId]);

  const loadConversations = async () => {
    if (!user) return;

    const res = await axios.get(
      `http://localhost:8081/api/messages/conversations/${user.user_id}`
    );
    const data = res.data;

    const convMap = new Map();

    data.forEach((msg) => {
      const otherUserId =
        msg.sender_id === user.user_id ? msg.receiver_id : msg.sender_id;

      const otherUser = {
        first_name: msg.sender_id === user.user_id ? msg.r_first : msg.s_first,
        last_name: msg.sender_id === user.user_id ? msg.r_last : msg.s_last,
      };

      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: msg,
          unread:
            msg.receiver_id === user.user_id && msg.is_read === 0,
        });
      }
    });

    setConversations(Array.from(convMap.values()));
  };

  const loadMessages = async (otherUserId) => {
    const res = await axios.get(
      `http://localhost:8081/api/messages/chat/${user.user_id}/${otherUserId}`
    );
    setMessages(res.data);

    await axios.post("http://localhost:8081/api/messages/read", {
      receiver_id: user.user_id,
      sender_id: otherUserId,
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await axios.post("http://localhost:8081/api/messages/send", {
      sender_id: user.user_id,
      receiver_id: selectedConversation,
      product_id: productId,
      message_text: newMessage,
    });

    setNewMessage("");
    loadMessages(selectedConversation);
    loadConversations();
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Giriş yapılıyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-6 py-8 flex">
        <div className="w-1/3 bg-white rounded-xl shadow p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Mesajlar</h2>
          {conversations.map((conv) => (
            <div
              key={conv.userId}
              onClick={() => {
                setSelectedConversation(conv.userId);
                loadMessages(conv.userId);
              }}
              className={`p-3 cursor-pointer rounded-lg ${
                selectedConversation === conv.userId
                  ? "bg-orange-100"
                  : "hover:bg-orange-50"
              }`}
            >
              <p className="font-semibold">
                {conv.user.first_name} {conv.user.last_name}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {conv.lastMessage.message_text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white ml-4 rounded-xl shadow p-4 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="font-bold text-lg mb-3">
                {
                  conversations.find(
                    (c) => c.userId === selectedConversation
                  )?.user.first_name
                }
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`flex ${
                      msg.sender_id === user.user_id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.sender_id === user.user_id
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.message_text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="mt-4 flex">
                <input
                  className="flex-1 border p-2 rounded-lg"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesaj yazın..."
                />
                <button className="ml-2 bg-orange-600 text-white px-4 rounded-lg">
                  Gönder
                </button>
              </form>
            </>
          ) : (
            <p className="text-gray-600 m-auto">Bir sohbet seçin</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
