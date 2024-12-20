"use client";

import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const auth = useAuth();
  const router = useRouter();
  const [geminiResponse, setGeminiResponse] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userPrompt = prompt;
    setPrompt("");
    
    // 创建新的聊天集合
    const response = await fetch("/api/chat/collections", {
      method: "POST",
      body: JSON.stringify({
        userId: auth.user?.profile.sub,
        name: `新对话 ${new Date().toLocaleString()}`
      })
    });
    const { id } = await response.json();
    
    // 触发事件，通知Sidebar更新
    window.dispatchEvent(new Event('collectionUpdated'));
    
    // 跳转到新创建的聊天页面
    router.push(`/chat?id=${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
