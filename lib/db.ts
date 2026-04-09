import { supabase } from "@/lib/supabase";
import { TestRecord, NetworkRanking, NetworkProvider } from "@/types";

export async function saveTestResult(record: TestRecord): Promise<void> {
  const { error } = await supabase.from("speed_tests").insert([record]);
  if (error) console.error("Failed to save:", error.message);
}

export async function getRankingsByState(state?: string): Promise<NetworkRanking[]> {
  let query = supabase.from("speed_tests").select("network, download_mbps, upload_mbps, ping_ms");
  if (state && state !== "All States") query = query.ilike("state", `%${state}%`);
  const { data, error } = await query;
  if (error || !data) return [];
  const grouped: Record<string, number[][]> = {};
  for (const row of data) {
    if (!grouped[row.network]) grouped[row.network] = [];
    grouped[row.network].push([row.download_mbps, row.upload_mbps, row.ping_ms]);
  }
  return Object.entries(grouped).map(([network, records]) => {
    const avg_download = records.reduce((s, r) => s + r[0], 0) / records.length;
    const avg_upload = records.reduce((s, r) => s + r[1], 0) / records.length;
    const avg_ping = records.reduce((s, r) => s + r[2], 0) / records.length;
    const score = avg_download * 0.5 + avg_upload * 0.3 + (1000 / avg_ping) * 0.2;
    return { network: network as NetworkProvider, avg_download: Math.round(avg_download * 10) / 10, avg_upload: Math.round(avg_upload * 10) / 10, avg_ping: Math.round(avg_ping), test_count: records.length, score: Math.round(score * 10) / 10 };
  }).sort((a, b) => b.score - a.score);
}
