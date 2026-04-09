"use client";

import { useState, useCallback } from "react";
import { SpeedTestResult, ISPInfo } from "@/types";
import { runSpeedTest } from "@/lib/speedtest";
import { detectISP } from "@/lib/isp";
import { saveTestResult } from "@/lib/db";

export type TestPhase = "idle" | "detecting" | "testing" | "done" | "error";

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [ispInfo, setIspInfo] = useState<ISPInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTest = useCallback(async () => {
    setPhase("detecting");
    setProgress(5);
    setProgressLabel("Detecting your network...");
    setError(null);
    setResult(null);

    try {
      console.log("Step 1: Detecting ISP...");
      const isp = await detectISP();
      console.log("ISP detected:", isp);
      setIspInfo(isp);
      setPhase("testing");

      console.log("Step 2: Starting speed test...");
      const speedResult = await runSpeedTest((label, pct) => {
        console.log("Progress:", pct, label);
        setProgressLabel(label);
        setProgress(pct);
      });

      console.log("Result:", speedResult);
      setResult(speedResult);
      setProgress(100);
      setPhase("done");

      saveTestResult({
        isp: isp.isp,
        network: isp.provider,
        download_mbps: speedResult.downloadMbps,
        upload_mbps: speedResult.uploadMbps,
        ping_ms: speedResult.pingMs,
        jitter_ms: speedResult.jitterMs,
        city: isp.city,
        state: isp.state,
      }).catch(console.error);

    } catch (err) {
      console.error("FULL ERROR:", err);
      console.error("Message:", (err as Error).message);
      setError("Something went wrong. Check your connection and try again.");
      setPhase("error");
    }
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    setProgressLabel("");
    setResult(null);
    setError(null);
  }, []);

  return { phase, progress, progressLabel, result, ispInfo, error, startTest, reset };
}
