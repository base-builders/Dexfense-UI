import { NextResponse } from "next/server";
import API from "@/shared/api/axios";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export async function GET(
  _: Request,
  { params: { address } }: { params: { address: string } }
) {
  try {
    console.log("Fetching balance for address:", address);
    const res = await API.get(
      `${SERVER_URL}/api/users/balance?address=${address}`,
      { validateStatus: () => true }
    );

    if (res.status >= 400) {
      return NextResponse.json(
        { error: res.data?.error || "Failed to retrieve balance" },
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
