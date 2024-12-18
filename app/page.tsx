import Head from 'next/head';
import Chat from '../components/Chat'; 
import VoiceChat from '../components/VoiceChat';
import ImageUpload from '../components/ImageUpload';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import 'regenerator-runtime/runtime';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Gemini 对话平台</title>
        <meta name="description" content="使用 Google Gemini API 的对话平台" />
      </Head>
      <main className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
        <h1 className="text-3xl text-center font-bold">Gemini 对话平台</h1>
        <Chat />
        <VoiceChat />
        <ImageUpload />
      </main>
      <ToastContainer />
    </div>
  );
}
