export type NetworkProvider = "MTN" | "Airtel" | "Glo" | "9mobile" | "Unknown";

export interface ISPInfo {
  isp: string;
  provider: NetworkProvider;
  city: string;
  state: string;
  country: string;
  ip: string;
}

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  timestamp: string;
}

export interface TestRecord {
  id?: string;
  isp: string;
  network: NetworkProvider;
  download_mbps: number;
  upload_mbps: number;
  ping_ms: number;
  jitter_ms: number;
  city: string;
  state: string;
  created_at?: string;
}

export interface NetworkRanking {
  network: NetworkProvider;
  avg_download: number;
  avg_upload: number;
  avg_ping: number;
  test_count: number;
  score: number;
}

export interface NetworkMeta {
  name: NetworkProvider;
  color: string;
  bgColor: string;
  borderColor: string;
  logo: string;
  tagline: string;
}
