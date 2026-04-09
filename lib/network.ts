import { NetworkProvider, NetworkMeta } from "@/types";

export const NETWORK_META: Record<NetworkProvider, NetworkMeta> = {
  MTN: { name: "MTN", color: "#FFCC00", bgColor: "#FFFBEB", borderColor: "#F59E0B", logo: "📡", tagline: "Everywhere You Go" },
  Airtel: { name: "Airtel", color: "#E4002B", bgColor: "#FFF1F2", borderColor: "#E4002B", logo: "📶", tagline: "Transforming Lives" },
  Glo: { name: "Glo", color: "#00A651", bgColor: "#F0FDF4", borderColor: "#00A651", logo: "🌐", tagline: "Rule Your World" },
  "9mobile": { name: "9mobile", color: "#006633", bgColor: "#ECFDF5", borderColor: "#006633", logo: "📲", tagline: "Simply Smarter" },
  Unknown: { name: "Unknown", color: "#6B7280", bgColor: "#F9FAFB", borderColor: "#6B7280", logo: "❓", tagline: "Network Unknown" },
};

export const ISP_PATTERNS: Record<NetworkProvider, string[]> = {
  MTN: ["mtn", "mtn nigeria", "mtn-ng"],
  Airtel: ["airtel", "airtel nigeria", "bharti airtel"],
  Glo: ["glo", "globacom", "glo mobile"],
  "9mobile": ["9mobile", "etisalat nigeria", "emts", "9mobile nigeria"],
  Unknown: [],
};

export function detectProvider(ispString: string): NetworkProvider {
  const lower = ispString.toLowerCase();
  for (const [provider, patterns] of Object.entries(ISP_PATTERNS)) {
    if (provider === "Unknown") continue;
    if (patterns.some((p) => lower.includes(p))) return provider as NetworkProvider;
  }
  return "Unknown";
}