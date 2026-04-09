import { SpeedTestResult } from "@/types";

function generateRandomData(size: number): ArrayBuffer {
  const data = new Uint8Array(size);
  const chunkSize = 65536;
  for (let i = 0; i < size; i += chunkSize) {
    const chunk = data.subarray(i, Math.min(i + chunkSize, size));
    crypto.getRandomValues(chunk);
  }
  return data.buffer;
}

// Measure ping directly to Cloudflare — bypasses Vercel completely
async function measurePing(): Promise<{ ping: number; jitter: number }> {
  const samples: number[] = [];

  for (let i = 0; i < 6; i++) {
    const start = performance.now();
    try {
      await fetch(
        `https://speed.cloudflare.com/__down?bytes=0&t=${Date.now()}`,
        { cache: "no-store", mode: "cors" }
      );
      samples.push(performance.now() - start);
    } catch {
      samples.push(999);
    }
  }

  // Drop highest and lowest to remove outliers
  const sorted = [...samples].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);

  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  const jitter =
    trimmed.reduce((acc, val) => acc + Math.abs(val - avg), 0) / trimmed.length;

  return {
    ping: Math.round(avg),
    jitter: Math.round(jitter),
  };
}

// Download directly from Cloudflare — bypasses Vercel completely
async function measureDownload(): Promise<number> {
  const start = performance.now();
  try {
    const response = await fetch(
      `https://speed.cloudflare.com/__down?bytes=10000000&t=${Date.now()}`,
      { cache: "no-store", mode: "cors" }
    );
    const buffer = await response.arrayBuffer();
    const duration = (performance.now() - start) / 1000;
    const bitsLoaded = buffer.byteLength * 8;
    return Math.round((bitsLoaded / duration / 1_000_000) * 100) / 100;
  } catch (e) {
    console.error("Download error:", e);
    return 0;
  }
}

// Upload directly to Cloudflare — bypasses Vercel completely
async function measureUpload(): Promise<number> {
  const SIZE = 2 * 1024 * 1024; // 2MB
  const data = generateRandomData(SIZE);
  const start = performance.now();
  try {
    await fetch(
      `https://speed.cloudflare.com/__up?t=${Date.now()}`,
      {
        method: "POST",
        body: data as BodyInit,
        cache: "no-store",
        mode: "cors",
      }
    );
    const duration = (performance.now() - start) / 1000;
    return Math.round((SIZE * 8 / duration / 1_000_000) * 100) / 100;
  } catch (e) {
    console.error("Upload error:", e);
    return 0;
  }
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
