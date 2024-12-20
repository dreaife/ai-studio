const { GoogleGenerativeAI } = require("@google/generative-ai");
import { NextResponse } from "next/server";
import { Pool } from 'pg';

const genAI = new GoogleGenerativeAI(process.env.MY_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.MY_DEFAULT_GEMINI_MODEL });

// 创建数据库连接池
const pool = new Pool({
  host: 'database-1.cn84eyg6sx64.ap-northeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'ai_chat',
  user: 'postgres',
  password: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(req: Request) {  
  const prompt = "Explain how AI works";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());

  return NextResponse.json(result.response.text());
}

export async function POST(req: Request) {
  const { prompt, history, chatId } = await req.json();
  
  // 直接使用数据库连接保存用户消息
  await pool.query(
    'INSERT INTO chat_messages (collection_id, role, content, sequence_number) VALUES ($1, $2, $3, $4)',
    [chatId, 'user', prompt, history.length]
  );
  
  const chat = model.startChat({
    history: history || []
  });
  
  const result = await chat.sendMessageStream(prompt);
  let fullResponse = '';
  
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullResponse += text;
        controller.enqueue(text);
      }
      
      // 直接使用数据库连接保存模型响应
      await pool.query(
        'INSERT INTO chat_messages (collection_id, role, content, sequence_number) VALUES ($1, $2, $3, $4)',
        [chatId, 'model', fullResponse, history.length + 1]
      );
      
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    },
  });
}