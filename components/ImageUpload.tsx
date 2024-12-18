// app/components/ImageUpload.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ImageUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

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
        setImage(base64Image);
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
    accept: { 'image/*': [] },
  });

  const sendImage = async (base64Image: string) => {
    const userMessage: Message = { sender: 'user', text: '发送了一张图片。' };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post(
        '/api/gemini',
        { image: base64Image },
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
      toast.error('发送图片时发生错误');
    }
  };

  return (
    <div className="flex flex-col border border-gray-300 p-4 rounded-lg bg-gray-50">
      <h2 className="text-2xl mb-4">图片上传</h2>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer mb-4 rounded-lg bg-gray-100"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>拖拽图片到此区域...</p>
        ) : (
          <p>点击或拖拽图片到此区域上传</p>
        )}
      </div>
      {image && (
        <img src={image} alt="上传的图片" className="mb-4 rounded-lg max-h-64" />
      )}
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
