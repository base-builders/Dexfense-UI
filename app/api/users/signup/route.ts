import { NextResponse } from "next/server";
import axios from "axios";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, password, code } = body;

    if (!address || !password) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const res = await axios.post(`${SERVER_URL}/api/users/signup`, {
      address,
      password,
      code,
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        data: res.data,
      },
      { status: res.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
