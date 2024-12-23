"use client";

import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

interface ChatContent {
  text: string;
  images?: string[];
}

interface ChatMessage {
  role: string;
  content: {
    text: string;
    images?: string[];
  } | string;
}

export default function ChatInterface({ chatId }: { chatId: number }) {
  const [geminiResponse, setGeminiResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    console.log("===ChatInterface mounted");
    if (chatId) {
      fetchChatHistory();
    }
  }, [chatId]);

  const fetchChatHistory = async () => {
    const response = await fetch(`/api/chat/messages?chatId=${chatId}`);
    const history = await response.json();
    console.log("===Fetched chat history:", history);
    setChatHistory(history);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userPrompt = prompt;
    setPrompt("");

    const formData = new FormData();
    formData.append("prompt", userPrompt);
    formData.append("chatId", chatId.toString());
    selectedImages.forEach((image) => {
      formData.append("image", image);
    });

    // 发送请求到后端 API
    const response = await fetch("/api/gemini", {
      method: "POST",
      body: formData,
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    let accumulatedResponse = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        accumulatedResponse += text;
        setGeminiResponse(accumulatedResponse);
        console.log("Gemini response:", accumulatedResponse);
      }
    } finally {
      reader.releaseLock();
    }

    // 重新获取聊天记录以显示最新消息
    fetchChatHistory();

    // 清空已选择的图片
    setSelectedImages([]);
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {typeof msg.content === 'object' && msg.content.images && (
                <div className="mb-2">
                  {msg.content.images.map((src, idx) => (
                    <img key={idx} src={src} alt={`Uploaded ${idx + 1}`} className="mb-2 max-w-full h-auto" />
                  ))}
                </div>
              )}
              <ReactMarkdown className="prose prose-slate">
                {typeof msg.content === 'object' ? msg.content.text : msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {geminiResponse && (
          <div className="mb-4 text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-100 max-w-[80%]">
              <ReactMarkdown className="prose prose-slate">
                {geminiResponse}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            className="p-3 border rounded-lg"
            placeholder="请输入问题..."
            required
          />
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
            multiple
            onChange={handleImageChange}
            className="p-3 border rounded-lg"
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
  );
}