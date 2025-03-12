"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "../types/chat";
import { Card } from "@/components/ui/card";
import { User2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ChatListProps {
  conversations: Conversation[];
  onSelectChat: (phone: string) => void;
  onDeleteChat: (phone: string) => void;
  selectedChat?: string;
}

export function ChatList({ conversations, onSelectChat, onDeleteChat, selectedChat }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name_contact?.toLowerCase().includes(searchLower) ||
      contact.session_id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="h-full bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Conversas</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-2">
          {filteredConversations.map((contact) => (
            <div
              key={contact.session_id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat === contact.session_id
                  ? "bg-primary/10"
                  : "hover:bg-muted"
              }`}
            >
              <div
                className="flex flex-1 items-center gap-3"
                onClick={() => onSelectChat(contact.session_id)}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User2 className="h-5 w-5" />
                  {contact.hasNewMessages && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium leading-none mb-1">
                    {contact.name_contact || "Desconhecido"}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {contact.session_id}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(contact.session_id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}