// app/components/InputArea.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface InputAreaProps {
  onNewMessage: (msg: Message) => void;
}

export default function InputArea({ onNewMessage }: InputAreaProps) {
  const [input, setInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { sender: 'user', text: message };
    onNewMessage(userMessage);
    setInput(''); // 发送后清空输入框

    try {
      const res = await axios.post(
        '/api/gemini',
        { message },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_MY_SECRET_API_KEY,
          },
        }
      );
      const botMessage: Message = { sender: 'bot', text: res.data.reply };
      onNewMessage(botMessage);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { sender: 'bot', text: '抱歉，发送消息时发生了错误。' };
      onNewMessage(errorMessage);
      toast.error('发送消息时发生错误');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 压缩图片
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        sendImage(base64Image);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error(error);
      toast.error('图片压缩失败');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: false,
  });

  const sendImage = async (base64Image: string) => {
    const userMessage: Message = { sender: 'user', text: '发送了一张图片。' };
    onNewMessage(userMessage);

    try {
      const res = await axios.post(
        '/api/gemini',
        { image: base64Image },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_MY_SECRET_API_KEY,
          },
        }
      );
      const botMessage: Message = { sender: 'bot', text: res.data.reply };
      onNewMessage(botMessage);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { sender: 'bot', text: '抱歉，发送图片时发生了错误。' };
      onNewMessage(errorMessage);
      toast.error('发送图片时发生错误');
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 lg:w-1/2 bg-white rounded-full shadow-lg flex items-center px-4 py-2">
      {/* 图片上传按钮 */}
      <div {...getRootProps()} className="mr-2 cursor-pointer">
        <input {...getInputProps()} />
        <svg
          className="w-6 h-6 text-gray-600 hover:text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* 语音输入按钮 */}
      <button
        // onClick={startListening}
        className="mr-2 p-2 text-gray-600 hover:text-gray-800"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v3m0-3a3 3 0 110-6 3 3 0 010 6zM5 12a7 7 0 1114 0H5z"
          />
        </svg>
      </button>

      {/* 输入框 */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
          rows={1}
        />
        {/* 发送按钮 */}
        <button
          onClick={() => sendMessage(input)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M12 5l7 7-7 7"
            />
            {/* </path> */}
          </svg>
        </button>
      </div>
    </div>
  );
}
