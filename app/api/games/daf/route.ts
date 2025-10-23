import { NextResponse } from "next/server";
import API from "@/shared/api/axios";

interface Params {
  difficulty: string;
}

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const response = await API.get(
      `${SERVER_URL}/api/games/daf?difficulty=${difficulty}`
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.error();
  }
}
