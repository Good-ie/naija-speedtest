"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NetworkRanking, NetworkProvider } from "@/types";
import { getRankingsByState } from "@/lib/db";
import { NETWORK_META } from "@/lib/networks";
import NetworkGrid from "@/components/ui/NetworkGrid";

const STATES = [
  "All States",
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Abuja (FCT)",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

export default function Rankings() {
  const [rankings, setRankings] = useState<NetworkRanking[]>([]);
  const [state, setState] = useState("All States");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    getRankingsByState(state)
      .then(setRankings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [state]);

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0A", padding:"6rem 1.5rem 2rem", maxWidth:"700px", margin:"0 auto", position:"relative" }}>

      <NetworkGrid accentColor="#FFCC00" />
      
      <style>{`
        .state-select {
          appearance: none;
          background: #141414;
          border: 1px solid #2A2A2A;
          border-radius: 10px;
          color: white;
          font-size: 13px;
          font-family: monospace;
          padding: 10px 36px 10px 14px;
          cursor: pointer;
          outline: none;
          min-width: 200px;
          transition: border-color 0.2s;
        }
        .state-select:focus { border-color: #FFCC00; }
        .state-select option { background: #141414; color: white; }
        .select-wrap { position: relative; display: inline-block; }
        .select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #FFCC00; font-size: 11px; pointer-events: none; }
      `}</style>


      {/* Header */}
      <div style={{ marginBottom:"2rem", position:"relative", zIndex:1 }}>
        <Link href="/" style={{ color:"#6B7280", fontSize:"0.85rem", fontFamily:"monospace", textDecoration:"none" }}>
          ← Back to test
        </Link>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"0.75rem" }}>
          <div>
            <h1 style={{ fontSize:"2rem", fontWeight:"800", margin:"0 0 0.25rem", letterSpacing:"-0.02em", color:"white" }}>
              Network <span style={{ color:"#FFCC00" }}>Rankings</span>
            </h1>
            <p style={{ color:"#6B7280", fontSize:"0.9rem", margin:0 }}>
              Best networks by location — based on real user tests
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
      <div style={{ marginBottom:"1.5rem", overflowX:"auto", display:"flex", gap:"8px", paddingBottom:"4px", position:"relative", zIndex:1 }}>
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

      {/* Rankings List */}
      <div style={{ position:"relative", zIndex:1 }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"#6B7280", fontFamily:"monospace" }}>
            Loading rankings...
          </div>
        ) : rankings.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem", background:"rgba(20,20,20,0.85)", borderRadius:"16px", border:"1px solid #2A2A2A", backdropFilter:"blur(8px)" }}>
            <p style={{ color:"#6B7280", fontFamily:"monospace", margin:0 }}>No test data yet for {state}.</p>
            <p style={{ color:"#444", fontSize:"0.8rem", fontFamily:"monospace", marginTop:"0.5rem" }}>Run a speed test to be the first!</p>
            <Link href="/" style={{ display:"inline-block", marginTop:"1rem", padding:"8px 20px", borderRadius:"999px", background:"#FFCC0022", border:"1px solid #FFCC0044", color:"#FFCC00", fontSize:"0.85rem", fontFamily:"monospace", textDecoration:"none" }}>
              Run Test →
            </Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {rankings.map((ranking, index) => {
              const meta = NETWORK_META[ranking.network as NetworkProvider];
              const medals = ["🥇","🥈","🥉"];
              return (
                <div key={ranking.network} style={{
                  background:"rgba(20,20,20,0.85)",
                  border:"1px solid",
                  borderColor: index===0 ? meta.color+"44" : "#2A2A2A",
                  borderRadius:"16px", padding:"1.25rem",
                  display:"flex", alignItems:"center", gap:"1rem",
                  backdropFilter:"blur(8px)",
                }}>
                  <div style={{ fontSize:"1.5rem", width:"36px", textAlign:"center" }}>
                    {medals[index] || `#${index+1}`}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                      <span style={{ fontSize:"1rem" }}>{meta.logo}</span>
                      <span style={{ fontWeight:"700", fontSize:"1rem", color:meta.color }}>{meta.name}</span>
                      <span style={{ fontSize:"0.65rem", fontFamily:"monospace", padding:"2px 6px", borderRadius:"999px", background:"#2A2A2A", color:"#6B7280" }}>
                        {ranking.test_count} test{ranking.test_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                      {[
                        { label:"↓", value:ranking.avg_download, unit:"Mbps" },
                        { label:"↑", value:ranking.avg_upload, unit:"Mbps" },
                        { label:"◎", value:ranking.avg_ping, unit:"ms" },
                      ].map(({ label, value, unit }) => (
                        <div key={label} style={{ display:"flex", alignItems:"baseline", gap:"3px" }}>
                          <span style={{ fontSize:"0.75rem", color:"#6B7280", fontFamily:"monospace" }}>{label}</span>
                          <span style={{ fontSize:"0.9rem", fontWeight:"700", fontFamily:"monospace", color:"white" }}>{value.toFixed(1)}</span>
                          <span style={{ fontSize:"0.7rem", color:"#6B7280", fontFamily:"monospace" }}>{unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"1.5rem", fontWeight:"800", fontFamily:"monospace", color:index===0 ? meta.color : "white" }}>
                      {ranking.score}
                    </div>
                    <div style={{ fontSize:"0.65rem", color:"#6B7280", fontFamily:"monospace" }}>score</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p style={{ textAlign:"center", color:"#333", fontSize:"0.75rem", fontFamily:"monospace", marginTop:"2rem", position:"relative", zIndex:1 }}>
        Rankings update in real time as users run tests
      </p>
    </main>
  );
}
