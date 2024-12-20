"use client";

import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const auth = useAuth();
  const router = useRouter();
  const [geminiResponse, setGeminiResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userPrompt = prompt;
    setPrompt("");

    if (!chatId) {
      const response = await fetch("/api/chat/collections", {
        method: "POST",
        body: JSON.stringify({
          userId: auth.user?.profile.sub,
          name: `新对话 ${new Date().toLocaleString()}`
        })
      });
      const { id } = await response.json();
      setChatId(id);
      console.log("New chatId", id);
      await sendChatMessage(id, userPrompt);

      // 触发事件，通知Sidebar更新
      window.dispatchEvent(new Event('collectionUpdated'));

      router.push(`/chat?id=${id}`);
    } else {
      await sendChatMessage(chatId, userPrompt);
    }
  };

  const sendChatMessage = async (id: number, userPrompt: string) => {
    const chatResponse = await fetch("/api/gemini", {
      method: "POST",
      body: JSON.stringify({
        prompt: userPrompt,
        chatId: id,
        history: []  // 初始历史记录为空
      })
    });

    const reader = chatResponse.body?.getReader();
    if (!reader) return;

    let accumulatedResponse = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        accumulatedResponse += text;
        setGeminiResponse(accumulatedResponse);
      }
    } finally {
      reader.releaseLock();
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          {chatId ? (
            <ChatInterface chatId={chatId} />
          ) : (
            <main className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">开始新对话</h2>
                    <p className="text-gray-600 mb-8">在下方输入你的问题，开始一个新的对话</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                    placeholder="请输入问题..."
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    发送
                  </button>
                </form>
              </div>
            </main>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
