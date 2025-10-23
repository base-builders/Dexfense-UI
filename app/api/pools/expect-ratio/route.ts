import { NextResponse } from "next/server";
import API from "@/shared/api/axios";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await API.get(`${SERVER_URL}/api/pools/expectRatio`, {});

    if (res.status >= 400) {
      return NextResponse.json(
        { error: res.data?.error || "Failed to retrieve expect ratio" },
        { status: res.status }
      );
    }
    return NextResponse.json(res.data, { status: res.status });
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
