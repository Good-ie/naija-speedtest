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

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

// Measure real network ping using Navigation Timing API
// This measures actual DNS + TCP connection time — not round trip to a far server
async function measurePing(): Promise<{ ping: number; jitter: number }> {
  const samples: number[] = [];

  for (let i = 0; i < 5; i++) {
    try {
      const url = `${getBaseUrl()}/api/speedtest?type=ping&t=${Date.now()}`;
      const start = performance.now();
      await fetch(url, { cache: "no-store", method: "HEAD" });
      const end = performance.now();

      // Use Navigation Timing if available for more accurate measurement
      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const entry = entries[entries.length - 1];

      if (entry && entry.connectEnd && entry.connectStart && entry.connectEnd > entry.connectStart) {
        // TCP connection time — most accurate measure of network latency
        samples.push(entry.connectEnd - entry.connectStart);
      } else if (entry && entry.responseStart && entry.requestStart) {
        // Time to first byte — good fallback
        samples.push(entry.responseStart - entry.requestStart);
      } else {
        // Basic round trip fallback
        samples.push((end - start) / 2);
      }
    } catch {
      samples.push(999);
    }
  }

  // Remove outliers — drop highest and lowest if we have enough samples
  const sorted = [...samples].sort((a, b) => a - b);
  const trimmed = sorted.length >= 4 ? sorted.slice(1, -1) : sorted;

  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  const jitter = trimmed.reduce((acc, val) => acc + Math.abs(val - avg), 0) / trimmed.length;

  return {
    ping: Math.round(avg),
    jitter: Math.round(jitter),
  };
}

// Download via Cloudflare proxy for accurate measurement
async function measureDownload(): Promise<number> {
  const start = performance.now();
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/speedtest?type=down&bytes=10000000&t=${Date.now()}`,
      { cache: "no-store" }
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

// Upload test — measures real upload to our server
async function measureUpload(): Promise<number> {
  const SIZE = 2 * 1024 * 1024; // 2MB
  const data = generateRandomData(SIZE);
  const start = performance.now();
  try {
    await fetch(`${getBaseUrl()}/api/speedtest?type=up&t=${Date.now()}`, {
      method: "POST",
      body: data as BodyInit,
      cache: "no-store",
    });
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
