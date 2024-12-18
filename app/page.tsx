'use client';

import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import Chat from '../components/Chat';
import InputArea from '../components/InputArea';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleNewMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Gemini 对话平台</title>
        <meta name="description" content="使用 Google Gemini API 的对话平台" />
      </Head>
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Gemini 对话平台</h1>
      </header>
      <main className="flex-1 bg-gray-100 relative flex justify-center">
        <div className="w-11/12 md:w-2/3 lg:w-3/4 xl:w-2/3 flex flex-col">
          <Chat messages={messages} />
          <InputArea onNewMessage={handleNewMessage} />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
