"use client";

import { useEffect, useRef } from "react";
import { useSpeedTest } from "@/hooks/useSpeedTest";
import { NETWORK_META } from "@/lib/networks";
import { getSpeedRating } from "@/lib/speedtest";

function NetworkGrid({ accentColor }: { accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes: { x:number;y:number;vx:number;vy:number;r:number;pulse:number }[] = [];
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.015;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (i >= j) return;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 188) {
            const alpha = 0.26 * 0.6 * (1 - d / 188);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `${accentColor}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      nodes.forEach(n => {
        const alpha = 0.26 * (0.5 + 0.3 * Math.sin(n.pulse));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${accentColor}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default function Home() {
  const { phase, progress, progressLabel, result, ispInfo, error, startTest, reset } = useSpeedTest();
  const isRunning = phase === "detecting" || phase === "testing";
  const isDone = phase === "done";
  const isIdle = phase === "idle" || phase === "error";
  const meta = ispInfo ? NETWORK_META[ispInfo.provider] : null;
  const accentColor = meta?.color || "#FFCC00";

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "5rem 1rem 2rem",
      gap: "1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      <NetworkGrid accentColor={accentColor} />

      <style>{`
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 30px ${accentColor}33,0 0 60px ${accentColor}11}
          50%{box-shadow:0 0 60px ${accentColor}66,0 0 120px ${accentColor}22}
        }
        @keyframes countUp {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes shimmer {
          0%{background-position:-200% 0}
          100%{background-position:200% 0}
        }
        @keyframes blink {
          0%,100%{opacity:1} 50%{opacity:0.3}
        }
        @keyframes expandRing {
          0%{opacity:0.6;transform:translate(-50%,-50%) scale(0.8)}
          100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}
        }
        .go-btn:active{transform:scale(0.95)}
      `}</style>

      {/* Title */}
      <div style={{ textAlign:"center", zIndex:1 }}>
        <h1 style={{
          fontSize: "clamp(2rem,7vw,3rem)",
          fontWeight: "800",
          margin: 0,
          letterSpacing: "-0.02em",
          color: "white",
        }}>
          Naija<span style={{ color:"#FFCC00" }}>Speed</span>
        </h1>
        <p style={{
          color: "#555",
          marginTop: "0.4rem",
          fontSize: "clamp(0.7rem,2.5vw,0.9rem)",
          fontFamily: "monospace",
        }}>
          Nigeria's network speed tester — MTN · Airtel · Glo · 9mobile
        </p>
      </div>

      {/* Network Badge */}
      {ispInfo && meta && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 20px",
          borderRadius: "999px",
          border: `1px solid ${accentColor}44`,
          background: `${accentColor}11`,
          zIndex: 1,
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize:"1.1rem" }}>{meta.logo}</span>
          <div>
            <p style={{ margin:0, fontSize:"0.75rem", fontWeight:"700", letterSpacing:"0.12em", color:accentColor, fontFamily:"monospace" }}>
              {meta.name}
            </p>
            <p style={{ margin:0, fontSize:"0.65rem", color:"#555", fontFamily:"monospace" }}>
              {ispInfo.city}, {ispInfo.state}
            </p>
          </div>
          <span style={{
            width: "8px", height: "8px",
            borderRadius: "50%",
            background: "#22C55E",
            display: "inline-block",
            animation: "blink 1.5s ease-in-out infinite",
          }} />
        </div>
      )}

      {/* GO Button */}
      <div style={{ position:"relative", zIndex:1 }}>
        {isRunning && [1,2,3].map(i => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: `${160+i*50}px`,
            height: `${160+i*50}px`,
            borderRadius: "50%",
            border: `1px solid ${accentColor}33`,
            transform: "translate(-50%,-50%)",
            animation: `expandRing 2s ease-out ${i*0.4}s infinite`,
          }} />
        ))}

        <button
          className="go-btn"
          onClick={isIdle ? startTest : isDone ? reset : undefined}
          disabled={isRunning}
          style={{
            width: "clamp(160px,42vw,200px)",
            height: "clamp(160px,42vw,200px)",
            borderRadius: "50%",
            border: `3px solid ${accentColor}`,
            background: isRunning ? `${accentColor}11` : isDone ? `${accentColor}22` : "rgba(10,10,10,0.8)",
            color: isRunning||isDone ? accentColor : "white",
            cursor: isRunning ? "not-allowed" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontWeight: "700",
            transition: "all 0.3s ease",
            animation: isIdle ? "glowPulse 2.5s ease-in-out infinite" : "none",
            backdropFilter: "blur(12px)",
          }}
        >
          {isIdle && (
            <>
              <span style={{ fontSize:"clamp(2.2rem,9vw,3rem)", color:accentColor }}>▶</span>
              <span style={{ fontSize:"clamp(0.75rem,2.5vw,0.9rem)", fontFamily:"monospace", letterSpacing:"0.25em", color:accentColor }}>GO</span>
            </>
          )}
          {isRunning && (
            <>
              <span style={{ fontSize:"clamp(1.8rem,7vw,2.5rem)", fontFamily:"monospace", color:accentColor }}>{progress}%</span>
              <span style={{ fontSize:"clamp(0.6rem,2vw,0.75rem)", color:"#666", fontFamily:"monospace" }}>testing...</span>
            </>
          )}
          {isDone && (
            <>
              <span style={{ fontSize:"clamp(2.2rem,9vw,3rem)", color:accentColor }}>↺</span>
              <span style={{ fontSize:"clamp(0.75rem,2.5vw,0.9rem)", fontFamily:"monospace", letterSpacing:"0.25em", color:accentColor }}>RETEST</span>
            </>
          )}
          {phase === "error" && (
            <>
              <span style={{ fontSize:"clamp(2.2rem,9vw,3rem)" }}>⚠</span>
              <span style={{ fontSize:"clamp(0.75rem,2.5vw,0.9rem)", fontFamily:"monospace", letterSpacing:"0.25em" }}>RETRY</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div style={{ width:"min(280px,85vw)", display:"flex", flexDirection:"column", gap:"8px", alignItems:"center", zIndex:1 }}>
          <p style={{ margin:0, fontSize:"0.8rem", fontFamily:"monospace", color:"#666" }}>{progressLabel}</p>
          <div style={{ width:"100%", height:"4px", background:"#1A1A1A", borderRadius:"999px", overflow:"hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: "999px",
              background: `linear-gradient(90deg,${accentColor} 0%,${accentColor}99 50%,${accentColor} 100%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s linear infinite",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Results */}
      {isDone && result && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "10px",
          width: "min(420px,92vw)",
          zIndex: 1,
        }}>
          {[
            { label:"Download", value:result.downloadMbps, unit:"Mbps" },
            { label:"Upload", value:result.uploadMbps, unit:"Mbps" },
            { label:"Ping", value:result.pingMs, unit:"ms" },
            { label:"Jitter", value:result.jitterMs, unit:"ms" },
          ].map(({ label, value, unit }, idx) => {
            const rating = unit === "Mbps" ? getSpeedRating(value) : null;
            return (
              <div key={label} style={{
                background: "rgba(20,20,20,0.85)",
                border: "1px solid #222",
                borderRadius: "16px",
                padding: "clamp(12px,3vw,18px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                animation: `countUp 0.4s ease-out ${idx*0.1}s both`,
                backdropFilter: "blur(8px)",
              }}>
                <p style={{ margin:0, fontSize:"clamp(0.6rem,2vw,0.7rem)", fontFamily:"monospace", color:"#555", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                  {label}
                </p>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"3px" }}>
                  <span style={{
                    fontSize: "clamp(1.8rem,7vw,2.5rem)",
                    fontWeight: "700",
                    fontFamily: "monospace",
                    color: rating?.color || accentColor,
                    animation: `countUp 0.5s ease-out ${idx*0.15}s both`,
                  }}>
                    {unit === "Mbps" ? value.toFixed(1) : value}
                  </span>
                  <span style={{ fontSize:"clamp(0.6rem,2vw,0.75rem)", color:"#555", marginBottom:"6px", fontFamily:"monospace" }}>
                    {unit}
                  </span>
                </div>
                {rating && (
                  <span style={{ fontSize:"clamp(0.55rem,1.8vw,0.65rem)", fontFamily:"monospace", padding:"2px 8px", borderRadius:"999px", color:rating.color, background:`${rating.color}22` }}>
                    {rating.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {phase === "error" && error && (
        <p style={{ color:"#E4002B", fontFamily:"monospace", fontSize:"0.85rem", textAlign:"center", maxWidth:"300px", zIndex:1 }}>
          {error}
        </p>
      )}

      {phase === "idle" && (
        <p style={{ color:"#444", fontFamily:"monospace", fontSize:"clamp(0.75rem,2.5vw,0.85rem)", zIndex:1 }}>
          Tap to test your connection
        </p>
      )}

      {/* Footer */}
      <div style={{ position:"absolute", bottom:"1rem", left:0, right:0, textAlign:"center", zIndex:1 }}>
        <p style={{ color:"#333", fontSize:"0.7rem", fontFamily:"monospace" }}>
          Built by <span style={{ color:"#555" }}>Novek Tech</span> · Lagos, Nigeria 🇳🇬
        </p>
      </div>

    </main>
  );
}
