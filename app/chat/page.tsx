"use client";

import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  const handleSelectChat = (id: number) => {
    console.log("Selected chat ID:", id);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onSelectChat={handleSelectChat} />
          <ChatInterface chatId={parseInt(chatId || '')} />
        </div>
      </div>
    </ProtectedRoute>
  );
}