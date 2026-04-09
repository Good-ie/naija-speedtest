import { SpeedTestResult } from "@/types";

function generateRandomData(size: number): Uint8Array {
  const data = new Uint8Array(size);
  const chunkSize = 65536;
  for (let i = 0; i < size; i += chunkSize) {
    const chunk = data.subarray(i, Math.min(i + chunkSize, size));
    crypto.getRandomValues(chunk);
  }
  return data;
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

async function measureDownload(): Promise<number> {
  const start = performance.now();
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/speedtest?type=down&bytes=5000000&t=${Date.now()}`,
      { cache: "no-store" }
    );
    const buffer = await response.arrayBuffer();
    const duration = (performance.now() - start) / 1000;
    return Math.round((buffer.byteLength * 8 / duration / 1_000_000) * 100) / 100;
  } catch (e) {
    console.error("Download error:", e);
    return 0;
  }
}

async function measureUpload(): Promise<number> {
  const SIZE = 2 * 1024 * 1024;
  const data = generateRandomData(SIZE);
  const start = performance.now();
  try {
    await fetch(`${getBaseUrl()}/api/speedtest?type=up&t=${Date.now()}`, {
      method: "POST",
      body: data,
      cache: "no-store",
    });
    const duration = (performance.now() - start) / 1000;
    return Math.round((SIZE * 8 / duration / 1_000_000) * 100) / 100;
  } catch (e) {
    console.error("Upload error:", e);
    return 0;
  }
}

async function measurePing(): Promise<{ ping: number; jitter: number }> {
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    try {
      await fetch(
        `${getBaseUrl()}/api/speedtest?type=ping&t=${Date.now()}`,
        { cache: "no-store" }
      );
      samples.push(performance.now() - start);
    } catch {
      samples.push(999);
    }
  }
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const jitter =
    samples.reduce((acc, val) => acc + Math.abs(val - avg), 0) / samples.length;
  return { ping: Math.round(avg), jitter: Math.round(jitter) };
}

export async function runSpeedTest(
  onProgress: (phase: string, percent: number) => void
): Promise<SpeedTestResult> {
  onProgress("Measuring ping...", 10);
  const { ping, jitter } = await measurePing();
  onProgress("Testing download speed...", 35);
  const downloadMbps = await measureDownload();
  onProgress("Testing upload speed...", 70);
  const uploadMbps = await measureUpload();
  onProgress("Finalizing results...", 95);
  return {
    downloadMbps,
    uploadMbps,
    pingMs: ping,
    jitterMs: jitter,
    timestamp: new Date().toISOString(),
  };
}

export function getSpeedRating(mbps: number): { label: string; color: string } {
  if (mbps >= 50) return { label: "Excellent", color: "#00A651" };
  if (mbps >= 20) return { label: "Good", color: "#84CC16" };
  if (mbps >= 10) return { label: "Fair", color: "#FFCC00" };
  if (mbps >= 5) return { label: "Poor", color: "#F97316" };
  return { label: "Very Poor", color: "#E4002B" };
}
