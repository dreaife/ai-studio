"use client";

import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <ChatInterface chatId={parseInt(chatId || '')} />
        </div>
      </div>
    </ProtectedRoute>
  );
}