// app/components/Chat.tsx
'use client';

import { useEffect, useRef } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatProps {
  messages: Message[];
}

export default function Chat({ messages }: ChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动到最新消息
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
      {messages?.map((msg, index) => (
        <div
          key={index}
          className={`mb-4 flex ${
            msg.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <p
            className={`max-w-md px-4 py-2 rounded-lg ${
              msg.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800'
            }`}
          >
            {msg.text}
          </p>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}
