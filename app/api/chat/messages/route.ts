import { NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  const result = await pool.query(
    'SELECT role, content FROM chat_messages WHERE collection_id = $1 ORDER BY sequence_number',
    [chatId]
  );
  
  return NextResponse.json(result.rows.map(row => {
    const content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
    return {
      role: row.role,
      content: { text: content.text, images: content.images || [] },
    };
  }));
}

export async function POST(req: Request) {
  const { chatId, role, content, sequence_number } = await req.json();
  
  const result = await pool.query(
    'INSERT INTO chat_messages (collection_id, role, content, sequence_number) VALUES ($1, $2, $3, $4) RETURNING id',
    [chatId, role, content, sequence_number]
  );
  
  return NextResponse.json({ id: result.rows[0].id });
}