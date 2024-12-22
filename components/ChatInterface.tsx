"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';

interface ChatHistory {
  role: string;
  parts: { text: string }[];
}

export default function ChatInterface({ chatId }: { chatId: number }) {
  const [geminiResponse, setGeminiResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    }
  }, [chatId]);

  const fetchChatHistory = async () => {
    const response = await fetch(`/api/chat/messages?chatId=${chatId}`);
    const history = await response.json();
    setChatHistory(history);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userPrompt = prompt;
    setPrompt("");

    const newUserMessage = {
      role: 'user',
      parts: [{ text: userPrompt }]
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    const response = await fetch("/api/gemini", {
      method: "POST",
      body: JSON.stringify({ 
        prompt: userPrompt,
        chatId: chatId,
        history: chatHistory 
      }),
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
      }

      const newModelMessage = {
        role: 'model',
        parts: [{ text: accumulatedResponse }]
      };
      setChatHistory(prev => [...prev, newModelMessage]);
      setGeminiResponse("");
    } finally {
      reader.releaseLock();
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <ReactMarkdown className="prose prose-slate">
                {msg.parts[0].text}
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
  );
}