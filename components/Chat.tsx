// app/components/Chat.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);

    try {
      const res = await axios.post(
        '/api/gemini',
        { message: input },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_MY_SECRET_API_KEY, // 注意：不要在前端暴露敏感密钥
          },
        }
      );
      const botMessage: Message = { sender: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { sender: 'bot', text: '抱歉，发生了错误。' };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('发送消息时发生错误');
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-96 border border-gray-300 p-4 rounded-lg bg-gray-50">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <p
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.sender === 'user' ? 'bg-green-200' : 'bg-red-200'
              }`}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          发送
        </button>
      </div>
    </div>
  );
}
