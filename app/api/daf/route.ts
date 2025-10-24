import { NextResponse } from "next/server";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function GET(request: Request) {
  // 실제로는 DB에서 데이터 fetch
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  if (!difficulty) {
    return NextResponse.json(
      { error: "Missing difficulty parameter" },
      { status: 400 }
    );
  }
  const response = await fetch(
    `${SERVER_URL}/api/games/daf?difficulty=${difficulty}`
  );
  const data = await response.json();
  return NextResponse.json(data);
}
