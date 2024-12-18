import Head from 'next/head';
import ChatContainer from '../components/ChatContainer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Gemini 对话平台</title>
        <meta name="description" content="使用 Google Gemini API 的对话平台" />
      </Head>
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Gemini 对话平台</h1>
      </header>
      <main className="flex-1 bg-gray-100">
        <ChatContainer />
      </main>
      <ToastContainer />
    </div>
  );
}
