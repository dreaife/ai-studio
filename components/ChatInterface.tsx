"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';

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
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatId) {
      setShouldScrollToBottom(true);
      fetchChatHistory();
    }
  }, [chatId]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        const container = chatContainerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;
        
        container.scrollTop = maxScroll;
        
        if (container.scrollTop < maxScroll) {
          setTimeout(() => {
            if (container && shouldScrollToBottom) {
              container.scrollTop = container.scrollHeight - container.clientHeight;
            }
          }, 100);
        }
      }
    };

    if (shouldScrollToBottom && chatHistory.length > 0) {
      setTimeout(scrollToBottom, 0);
    }
  }, [chatHistory, shouldScrollToBottom]);

  useEffect(() => {
    if (chatContainerRef.current && isGenerating) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, [chatHistory, geminiResponse, isGenerating]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/messages?chatId=${chatId}`);
      const history = await response.json();
      setChatHistory(history);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userPrompt = prompt;
    setPrompt("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '96px';
    }

    setIsGenerating(true);

    setChatHistory((prev) => [
      ...prev,
      { 
        role: 'user', 
        content: { 
          text: userPrompt, 
          images: selectedImages.length > 0 ? selectedImages.map(URL.
            createObjectURL) : [] 
        } 
      }
    ]);

    const formData = new FormData();
    formData.append("prompt", userPrompt);
    formData.append("chatId", chatId.toString());
    selectedImages.forEach((image) => {
      formData.append("image", image);
    });

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
      }
    } finally {
      reader.releaseLock();
      setIsGenerating(false);
    }

    setChatHistory((prev) => [
      ...prev,
      { 
        role: 'model', 
        content: { 
          text: accumulatedResponse,
          images: [] 
        } 
      }
    ]);
    setGeminiResponse("");
    setSelectedImages([]);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // 处理文本框自适应高度
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const maxHeight = window.innerHeight * 0.3; // 30% 的视窗高度
    
    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto';
    
    // 计算新的高度
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    setPrompt(textarea.value);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={chatContainerRef}
          className="absolute inset-0 overflow-y-auto scroll-smooth"
        >
          <div className="p-6">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {typeof msg.content === 'object' && msg.content.images && msg.content.images.length > 0 && (
                    <div className="mb-2 flex gap-2">
                      {msg.content.images.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  <ReactMarkdown 
                    className={`prose prose-slate mt-2 ${msg.role === 'user' ? 'whitespace-pre-wrap' : ''}`}
                    components={{
                      p: ({children}) => <p className={msg.role === 'user' ? 'mb-0' : ''}>{children}</p>
                    }}
                  >
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
        </div>
      </div>

      <div className="flex-none border-t bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected ${index + 1}`}
                  className="w-12 h-12 rounded-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <textarea 
            ref={textareaRef}
            value={prompt} 
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            className="p-3 border rounded-lg resize-none min-h-[96px] max-h-[30vh] overflow-y-auto"
            placeholder="请输入问题..."
            style={{ height: '96px' }} // 初始高度
            required
          />

          <div className="flex items-center justify-between">
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp, image.heic, image.heif"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="p-2 bg-gray-200 rounded-full">
                📎
              </span>
            </label>
            <button 
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-full"
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}