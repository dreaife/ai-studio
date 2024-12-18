'use client';

import { useState } from 'react';
import Chat from './Chat';
import InputArea from './InputArea';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <div className="flex flex-col h-full">
      <Chat messages={messages} />
      <footer>
        <InputArea onNewMessage={handleNewMessage} />
      </footer>
    </div>
  );
}
