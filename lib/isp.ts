import { ISPInfo } from "@/types";
import { detectProvider } from "@/lib/networks";

export async function detectISP(): Promise<ISPInfo> {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();

    if (!data.success) throw new Error("ISP detection failed");

    const ispName = data.connection?.isp || data.connection?.org || "";

    return {
      isp: ispName,
      provider: detectProvider(ispName),
      city: data.city || "Unknown City",
      state: data.region || "Unknown State",
      country: data.country || "Nigeria",
      ip: data.ip || "",
    };
  } catch {
    try {
      const res2 = await fetch("https://ipapi.co/json/");
      const data2 = await res2.json();
      const ispName = data2.org || "";
      return {
        isp: ispName,
        provider: detectProvider(ispName),
        city: data2.city || "Unknown City",
        state: data2.region || "Unknown State",
        country: data2.country_name || "Nigeria",
        ip: data2.ip || "",
      };
    } catch {
      return {
        isp: "Unknown",
        provider: "Unknown",
        city: "Unknown",
        state: "Unknown",
        country: "Nigeria",
        ip: "",
      };
    }
  }
}
