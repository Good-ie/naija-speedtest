"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NetworkRanking, NetworkProvider } from "@/types";
import { getRankingsByState } from "@/lib/db";
import { NETWORK_META } from "@/lib/networks";
import NetworkGrid from "@/components/ui/NetworkGrid";

const STATES = [
  "All States", "Lagos", "Abuja", "Rivers", "Kano", "Oyo",
  "Kaduna", "Delta", "Enugu", "Anambra", "Imo", "Ogun",
  "Edo", "Kwara", "Plateau", "Cross River", "Akwa Ibom",
];

const ALL_NETWORKS: NetworkProvider[] = ["MTN", "Airtel", "Glo", "9mobile"];
type Metric = "avg_download" | "avg_upload" | "avg_ping";

export default function Compare() {
  const [rankings, setRankings] = useState<NetworkRanking[]>([]);
  const [state, setState] = useState("All States");
  const [metric, setMetric] = useState<Metric>("avg_download");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    getRankingsByState(state)
      .then(setRankings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [state]);

  const getNetworkData = (network: NetworkProvider) =>
    rankings.find((r) => r.network === network) || null;

  const getBarWidth = (value: number, metric: Metric) => {
    const all = rankings.map((r) => r[metric]);
    const max = Math.max(...all, 1);
    if (metric === "avg_ping") return Math.round((1 - value / max) * 100);
    return Math.round((value / max) * 100);
  };

  const metricLabels: Record<Metric, string> = {
    avg_download: "Download Speed",
    avg_upload: "Upload Speed",
    avg_ping: "Ping (lower = better)",
  };

  const metricUnit: Record<Metric, string> = {
    avg_download: "Mbps",
    avg_upload: "Mbps",
    avg_ping: "ms",
  };

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0A", padding:"6rem 1.5rem 2rem", maxWidth:"700px", margin:"0 auto", position:"relative" }}>

      <NetworkGrid accentColor="#FFCC00" />

      {/* Header */}
      <div style={{ marginBottom:"2rem", position:"relative", zIndex:1 }}>
        <Link href="/" style={{ color:"#6B7280", fontSize:"0.85rem", fontFamily:"monospace", textDecoration:"none" }}>
          ← Back to test
        </Link>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"0.75rem" }}>
          <div>
            <h1 style={{ fontSize:"2rem", fontWeight:"800", margin:"0 0 0.25rem", letterSpacing:"-0.02em", color:"white" }}>
              Network <span style={{ color:"#FFCC00" }}>Compare</span>
            </h1>
            <p style={{ color:"#6B7280", fontSize:"0.9rem", margin:0 }}>
              Side by side — MTN vs Airtel vs Glo vs 9mobile
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{
              padding:"8px 16px", borderRadius:"999px",
              border:"1px solid #2A2A2A", background:"transparent",
              color:"#6B7280", fontSize:"0.8rem", fontFamily:"monospace",
              cursor:"pointer", transition:"all 0.2s",
            }}
            onMouseOver={e => { (e.target as HTMLElement).style.borderColor="#FFCC00"; (e.target as HTMLElement).style.color="#FFCC00"; }}
            onMouseOut={e => { (e.target as HTMLElement).style.borderColor="#2A2A2A"; (e.target as HTMLElement).style.color="#6B7280"; }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* State Filter */}
      <div style={{ marginBottom:"1rem", overflowX:"auto", display:"flex", gap:"8px", paddingBottom:"4px", position:"relative", zIndex:1 }}>
        {STATES.map((s) => (
          <button key={s} onClick={() => setState(s)} style={{
            padding:"6px 14px", borderRadius:"999px", border:"1px solid",
            borderColor: state===s ? "#FFCC00" : "#2A2A2A",
            background: state===s ? "#FFCC0022" : "transparent",
            color: state===s ? "#FFCC00" : "#6B7280",
            fontSize:"0.8rem", fontFamily:"monospace",
            cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s ease",
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Metric Selector */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"1.5rem", position:"relative", zIndex:1 }}>
        {(Object.keys(metricLabels) as Metric[]).map((m) => (
          <button key={m} onClick={() => setMetric(m)} style={{
            padding:"6px 14px", borderRadius:"8px", border:"1px solid",
            borderColor: metric===m ? "#FFCC00" : "#2A2A2A",
            background: metric===m ? "#FFCC0022" : "transparent",
            color: metric===m ? "#FFCC00" : "#6B7280",
            fontSize:"0.8rem", fontFamily:"monospace",
            cursor:"pointer", transition:"all 0.2s ease",
          }}>
            {m==="avg_download" ? "↓ Download" : m==="avg_upload" ? "↑ Upload" : "◎ Ping"}
          </button>
        ))}
      </div>

      <div style={{ position:"relative", zIndex:1 }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"#6B7280", fontFamily:"monospace" }}>
            Loading data...
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div style={{ background:"rgba(20,20,20,0.85)", borderRadius:"16px", border:"1px solid #2A2A2A", padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(8px)" }}>
              <p style={{ margin:"0 0 1.25rem", fontSize:"0.8rem", fontFamily:"monospace", color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {metricLabels[metric]}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {ALL_NETWORKS.map((network) => {
                  const data = getNetworkData(network);
                  const meta = NETWORK_META[network];
                  const value = data ? data[metric] : null;
                  const barWidth = data ? getBarWidth(data[metric], metric) : 0;
                  return (
                    <div key={network}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                          <span style={{ fontSize:"0.9rem" }}>{meta.logo}</span>
                          <span style={{ fontSize:"0.85rem", fontWeight:"700", color:meta.color, fontFamily:"monospace" }}>{meta.name}</span>
                        </div>
                        <span style={{ fontSize:"0.85rem", fontFamily:"monospace", color:value ? "white" : "#444" }}>
                          {value !== null ? `${value.toFixed(1)} ${metricUnit[metric]}` : "No data"}
                        </span>
                      </div>
                      <div style={{ height:"8px", background:"#2A2A2A", borderRadius:"999px", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:"999px", width:`${barWidth}%`, background:meta.color, transition:"width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Stats Table */}
            <div style={{ background:"rgba(20,20,20,0.85)", borderRadius:"16px", border:"1px solid #2A2A2A", overflow:"hidden", backdropFilter:"blur(8px)" }}>
              <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid #2A2A2A" }}>
                <p style={{ margin:0, fontSize:"0.8rem", fontFamily:"monospace", color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                  Full Comparison
                </p>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem", fontFamily:"monospace" }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #2A2A2A" }}>
                      <th style={{ padding:"10px 1.5rem", textAlign:"left", color:"#6B7280", fontWeight:"500" }}>Network</th>
                      <th style={{ padding:"10px 1rem", textAlign:"right", color:"#6B7280", fontWeight:"500" }}>↓ Down</th>
                      <th style={{ padding:"10px 1rem", textAlign:"right", color:"#6B7280", fontWeight:"500" }}>↑ Up</th>
                      <th style={{ padding:"10px 1rem", textAlign:"right", color:"#6B7280", fontWeight:"500" }}>◎ Ping</th>
                      <th style={{ padding:"10px 1.5rem", textAlign:"right", color:"#6B7280", fontWeight:"500" }}>Tests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_NETWORKS.map((network) => {
                      const data = getNetworkData(network);
                      const meta = NETWORK_META[network];
                      return (
                        <tr key={network} style={{ borderBottom:"1px solid #1A1A1A" }}>
                          <td style={{ padding:"12px 1.5rem" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                              <span>{meta.logo}</span>
                              <span style={{ color:meta.color, fontWeight:"700" }}>{meta.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:"12px 1rem", textAlign:"right", color:data?"white":"#444" }}>{data?`${data.avg_download.toFixed(1)}`:"—"}</td>
                          <td style={{ padding:"12px 1rem", textAlign:"right", color:data?"white":"#444" }}>{data?`${data.avg_upload.toFixed(1)}`:"—"}</td>
                          <td style={{ padding:"12px 1rem", textAlign:"right", color:data?"white":"#444" }}>{data?`${data.avg_ping}ms`:"—"}</td>
                          <td style={{ padding:"12px 1.5rem", textAlign:"right", color:"#6B7280" }}>{data?data.test_count:"—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {rankings.length === 0 && (
              <div style={{ textAlign:"center", padding:"2rem" }}>
                <p style={{ color:"#6B7280", fontFamily:"monospace" }}>No data yet for {state}.</p>
                <Link href="/" style={{ display:"inline-block", marginTop:"1rem", padding:"8px 20px", borderRadius:"999px", background:"#FFCC0022", border:"1px solid #FFCC0044", color:"#FFCC00", fontSize:"0.85rem", fontFamily:"monospace", textDecoration:"none" }}>
                  Run Test →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <p style={{ textAlign:"center", color:"#333", fontSize:"0.75rem", fontFamily:"monospace", marginTop:"2rem", position:"relative", zIndex:1 }}>
        Data updates in real time as users run tests
      </p>
    </main>
  );
}
