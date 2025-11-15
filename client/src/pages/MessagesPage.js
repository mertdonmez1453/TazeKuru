import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState(null);
  const [productId, setProductId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    const sellerId = searchParams.get("seller");
    const prodId = searchParams.get("product");
    if (sellerId) setReceiverId(parseInt(sellerId));
    if (prodId) setProductId(parseInt(prodId));
  }, []);

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
    if (selectedConversation) {
      loadMessages(selectedConversation);
      // Yeni mesajları dinle
      const channel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${userData?.user_id}`,
          },
          () => {
            loadMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);
    if (authUser) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .single();
      setUserData(data);
    }
  };

  const loadConversations = async () => {
    try {
      const { data } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey(user_id, first_name, last_name, username),
          receiver:users!messages_receiver_id_fkey(user_id, first_name, last_name, username),
          product:product!messages_product_id_fkey(product_id, name, photo)
        `)
        .or(`sender_id.eq.${userData.user_id},receiver_id.eq.${userData.user_id}`)
        .order("sent_at", { ascending: false });

      // Konuşmaları grupla
      const convMap = new Map();
      data?.forEach((msg) => {
        const otherUserId =
          msg.sender_id === userData.user_id ? msg.receiver_id : msg.sender_id;
        const otherUser =
          msg.sender_id === userData.user_id ? msg.receiver : msg.sender;

        if (!convMap.has(otherUserId)) {
          convMap.set(otherUserId, {
            userId: otherUserId,
            user: otherUser,
            lastMessage: msg,
            unread: msg.receiver_id === userData.user_id && !msg.is_read,
          });
        } else {
          const conv = convMap.get(otherUserId);
          if (msg.sent_at > conv.lastMessage.sent_at) {
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
      const { data } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey(user_id, first_name, last_name),
          receiver:users!messages_receiver_id_fkey(user_id, first_name, last_name)
        `)
        .or(
          `and(sender_id.eq.${userData.user_id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userData.user_id})`
        )
        .order("sent_at", { ascending: true });

      setMessages(data || []);

      // Okundu işaretle
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", userData.user_id)
        .eq("sender_id", otherUserId)
        .eq("is_read", false);
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase.from("messages").insert([
        {
          sender_id: userData.user_id,
          receiver_id: selectedConversation,
          product_id: productId,
          message_text: newMessage,
        },
      ]);

      if (error) throw error;

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-8rem)] flex">
          {/* Sol: Konuşma Listesi */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-orange-50">
              <h2 className="text-xl font-bold text-gray-800">Mesajlar</h2>
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
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-orange-50 transition ${
                      selectedConversation === conv.userId ? "bg-orange-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold">
                            {conv.user.first_name?.[0] || "?"}
                          </span>
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
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Henüz mesajınız yok
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Mesajlar */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-orange-50">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {
                      conversations.find((c) => c.userId === selectedConversation)
                        ?.user.first_name
                    }{" "}
                    {
                      conversations.find((c) => c.userId === selectedConversation)
                        ?.user.last_name
                    }
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${
                        msg.sender_id === userData.user_id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_id === userData.user_id
                            ? "bg-orange-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p>{msg.message_text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_id === userData.user_id
                              ? "text-orange-100"
                              : "text-gray-500"
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
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesaj yazın..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Gönder
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Bir konuşma seçin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;

