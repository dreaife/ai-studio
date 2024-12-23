import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from "next/server";
import { Pool } from 'pg';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!process.env.MY_GEMINI_API_KEY || !process.env.MY_DEFAULT_GEMINI_MODEL) {
  throw new Error('Missing required environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.MY_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: process.env.MY_DEFAULT_GEMINI_MODEL as string });

// 创建数据库连接池
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME as string,
  user: process.env.DATABASE_USER as string,
  password: process.env.DATABASE_PASSWORD as string,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET() {
  const prompt = "Explain how AI works";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());

  return NextResponse.json(result.response.text());
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const prompt = formData.get('prompt') as string;
  const chatId = parseInt(formData.get('chatId') as string);
  const images = formData.getAll('image') as File[];

  // 获取当前对话的消息数量
  const currentCountResult = await pool.query(
    'SELECT COUNT(*) FROM chat_messages WHERE collection_id = $1',
    [chatId]
  );
  const currentCount = parseInt(currentCountResult.rows[0].count);

  // 处理图片上传
  let imageUris: string[] = [];
  if (chatId && images.length > 0) {
    const directoryPath = path.join(process.cwd(), 'public', 'data', chatId.toString());
    await fs.mkdir(directoryPath, { recursive: true });

    for (const file of images) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(directoryPath, file.name);
      await fs.writeFile(filePath, buffer);
      imageUris.push(`/data/${chatId}/${file.name}`);
    }
  }

  // 构造 content 对象
  const content: any = {
    text: prompt,
  };
  if (imageUris.length > 0) {
    content.images = imageUris;
  }

  // 保存用户消息到数据库
  await pool.query(
    'INSERT INTO chat_messages (collection_id, role, content, sequence_number) VALUES ($1, $2, $3, $4)',
    [chatId, 'user', content, currentCount]
  );

  const chat = model.startChat({
    history: [] // 可以根据需要传递历史记录
  });

  // 将图片处理移到这里
  const parts = await Promise.all([
    ...imageUris.map(async uri => ({
      inlineData: {
        data: Buffer.from(await fs.readFile(path.join(process.cwd(), 'public', uri))).toString("base64"),
        mimeType: "image/jpeg",
      }
    })),
    prompt,
  ]);

  const result = await chat.sendMessageStream(parts);
  let fullResponse = '';

  const stream = new ReadableStream({
    start: async (controller) => {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullResponse += text;
        controller.enqueue(text);
      }

      // 构造模型响应的内容对象
      const modelContent: any = {
        text: fullResponse,
      };
      // if (imageUris.length > 0) {
      //   modelContent.images = imageUris;
      // }

      // 保存模型响应到数据库
      await pool.query(
        'INSERT INTO chat_messages (collection_id, role, content, sequence_number) VALUES ($1, $2, $3, $4)',
        [chatId, 'model', modelContent, currentCount + 1]
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