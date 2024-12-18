import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// console.log(genAI);
// console.log(process.env.GEMINI_API_KEY);

export async function POST(request) {
    // 验证 API 密钥
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.MY_SECRET_API_KEY) {
        return NextResponse.json({ error: '禁止访问' }, { status: 403 });
    }

    const { message, image } = await request.json();

    try {
        let response = '';
    
        if (message) {
          // 发送文本消息到 Gemini API
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
          const result = await model.generateContent(message);
          const apiResponse = await result.response;
          response = await apiResponse.text();
        }
    
        if (image) {
          // 处理并发送图片到 Gemini API（假设 API 支持图片）
          // 目前示例中仅处理文本，如需支持图片，请参考官方文档
          response = "图片功能暂未实现。";
        }
    
        return NextResponse.json({ reply: response });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
    }
}
