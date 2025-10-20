import { NextResponse } from "next/server";
import axios from "axios";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, password } = body;

    if (!address || !password) {
      return NextResponse.json(
        { error: "Missing address or password" },
        { status: 400 }
      );
    }

    const res = await axios.post(
      `${SERVER_URL}/api/users/signin`,
      {
        address,
        password,
      },
      { validateStatus: () => true }
    );

    if (res.status >= 400) {
      return NextResponse.json(
        { error: res.data?.error || "Failed to sign in" },
        { status: res.status }
      );
    }

    const token = res.headers["authorization"] || res.headers["Authorization"];

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token not found in response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Signin successful",
        token,
        user: res.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.response?.data?.error || "Invalid request",
      },
      {
        status: error?.response?.status || 500,
      }
    );
  }
}
