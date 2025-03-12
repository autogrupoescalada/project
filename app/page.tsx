"use client";

import { useEffect, useState } from "react";
import { ChatList } from "./components/chat-list";
import { ChatWindow } from "./components/chat-window";
import { Conversation, Message } from "./types/chat";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageCounts, setLastMessageCounts] = useState<Record<string, number>>({});

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        "https://autowebhook.escaladaecom.com.br/webhook/conversations"
      );
      const data = await response.json();
      if (data.conversations && Array.isArray(data.conversations)) {
        setConversations(prev => {
          return data.conversations.map(conv => {
            const currentCount = conv.messages?.length || 0;
            const lastCount = lastMessageCounts[conv.session_id] || 0;
            const hasNewMessages = currentCount > lastCount && conv.session_id !== selectedChat;
            
            return {
              ...conv,
              hasNewMessages
            };
          });
        });

        const newCounts: Record<string, number> = {};
        data.conversations.forEach(conv => {
          newCounts[conv.session_id] = conv.messages?.length || 0;
        });
        setLastMessageCounts(newCounts);
      }
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    }
  };

  const fetchMessages = async (phone: string) => {
    try {
      const response = await fetch(
        `https://autowebhook.escaladaecom.com.br/webhook/conversation-id?session_id=${phone}`
      );
      const data = await response.json();
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const handleSelectChat = async (phone: string) => {
    setSelectedChat(phone);
    setMessages([]);
    
    setConversations(prev => 
      prev.map(conv => 
        conv.session_id === phone 
          ? { ...conv, hasNewMessages: false }
          : conv
      )
    );
    
    await fetchMessages(phone);
  };

  const handleDeleteChat = async (phone: string) => {
    try {
      const response = await fetch(
        `https://autowebhook.escaladaecom.com.br/webhook/delete-conversation-id?session_id=${phone}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Remove the chat from the list
        setConversations(prev => prev.filter(conv => conv.session_id !== phone));
        
        // If the deleted chat was selected, clear the selection
        if (selectedChat === phone) {
          setSelectedChat(undefined);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const conversationsInterval = setInterval(fetchConversations, 60000);
    return () => clearInterval(conversationsInterval);
  }, []);

  useEffect(() => {
    let messagesInterval: NodeJS.Timeout;
    
    if (selectedChat) {
      messagesInterval = setInterval(() => {
        fetchMessages(selectedChat);
      }, 60000);
    }

    return () => {
      if (messagesInterval) {
        clearInterval(messagesInterval);
      }
    };
  }, [selectedChat]);

  return (
    <main className="flex h-screen bg-gray-100 p-4 gap-4">
      <div className="w-1/3">
        <ChatList
          conversations={conversations}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          selectedChat={selectedChat}
        />
      </div>
      <div className="flex-1">
        <ChatWindow
          messages={messages}
          selectedChat={selectedChat}
        />
      </div>
    </main>
  );
}