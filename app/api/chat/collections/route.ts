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
    // connectionString: process.env.DATABASE_URL
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const result = await pool.query(
    'SELECT * FROM chat_collections WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { userId, name } = await req.json();
  
  const result = await pool.query(
    'INSERT INTO chat_collections (user_id, collection_name) VALUES ($1, $2) RETURNING id',
    [userId, name]
  );
  
  return NextResponse.json({ id: result.rows[0].id });
}
