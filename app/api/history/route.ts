import { NextResponse } from "next/server";
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function GET() {
  // 실제로는 DB에서 데이터 fetch
  const response = await fetch(`${SERVER_URL}/api/games/history`);
  const data = await response.json();
  return NextResponse.json(data);
}
