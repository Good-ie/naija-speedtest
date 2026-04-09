import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bytes = searchParams.get("bytes") || "5000000";
  const type = searchParams.get("type") || "down";

  if (type === "ping") {
    return new NextResponse("", { status: 200 });
  }

  if (type === "down") {
    const size = parseInt(bytes);
    const buffer = new Uint8Array(size);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new NextResponse("OK", { status: 200 });
}

export async function POST() {
  return new NextResponse("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
