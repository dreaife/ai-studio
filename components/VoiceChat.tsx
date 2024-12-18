// app/components/VoiceChat.tsx
'use client';

import { useState } from 'react';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  // const { transcript, resetTranscript } = useSpeechRecognition();

  // if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
  //   return <span>抱歉，您的浏览器不支持语音识别。</span>;
  // }

  // const startListening = () => {
  //   SpeechRecognition.startListening({ continuous: false });
  // };

  const sendVoiceMessage = async () => {
    // if (!transcript.trim()) return;

    // const userMessage: Message = { sender: 'user', text: transcript };
    // setMessages([...messages, userMessage]);

    try {
      const res = await axios.post(
        '/api/gemini',
        { message: 'test' },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_MY_SECRET_API_KEY, // 注意：不要在前端暴露敏感密钥
          },
        }
      );
      const botMessage: Message = { sender: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);

      // 语音合成
      speak(botMessage.text);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { sender: 'bot', text: '抱歉，发生了错误。' };
      setMessages((prev) => [...prev, errorMessage]);
      speak(errorMessage.text);
      toast.error('发送语音消息时发生错误');
    }

    // resetTranscript();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col border border-gray-300 p-4 rounded-lg bg-gray-50">
      <h2 className="text-2xl mb-4">语音对话</h2>
      <div className="flex gap-4 mb-4">
        <button
          // onClick={startListening}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          开始说话
        </button>
        <button
          onClick={sendVoiceMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          发送
        </button>
      </div>
      {/* <p className="mb-4">识别内容: {transcript}</p> */}
      <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}
