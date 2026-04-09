import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "down";
  const bytes = searchParams.get("bytes") || "5000000";

  if (type === "ping") {
    return new NextResponse("", {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (type === "down") {
    try {
      const res = await fetch(
        `https://speed.cloudflare.com/__down?bytes=${bytes}`,
        { cache: "no-store" }
      );
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch {
      return new NextResponse("Error fetching download data", { status: 500 });
    }
  }

  return new NextResponse("OK", {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export async function POST() {
  return new NextResponse("OK", {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
