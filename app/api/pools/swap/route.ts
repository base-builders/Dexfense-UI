import { NextResponse } from "next/server";
import API from "@/shared/api/axios";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000"; // fallback

export async function POST(request: Request) {
  const body = await request.json();
  const authorizationHeader = request.headers.get("Authorization");
  const token = request.headers.get("Authorization");

  try {
    const response = await API.post(
      `${SERVER_URL}/api/pools/swap`,
      {
        token1AmountInput: body.token1Amount,
        token2AmountInput: body.token2Amount,
      },
      {
        headers: { Authorization: token },
      }
    );
    return NextResponse.json(
      {
        message: "Swap executed successfully",
        result: response.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Error proxying swap request:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: "Failed to swap",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
