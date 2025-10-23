import API from "@/shared/api/axios";
import { NextResponse } from "next/server";
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const difficulty = body.difficulty;
    if (!difficulty) {
      return NextResponse.json(
        { error: "Difficulty level is required" },
        { status: 400 }
      );
    }

    const token = request.headers.get("Authorization");
    const res = await API.post(
      `${SERVER_URL}/api/games/start`,
      { difficulty },
      {
        headers: { Authorization: token },
      }
    );
    console.log("Game started response:", res);
    return NextResponse.json({ message: "Game started", data: res.data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
