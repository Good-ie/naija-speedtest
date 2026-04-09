"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Test" },
  { href: "/rankings", label: "Rankings" },
  { href: "/compare", label: "Compare" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: "1px solid #2A2A2A",
      background: "rgba(10,10,10,0.9)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: "700px", margin: "0 auto",
        padding: "0 1.5rem", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "white" }}>
            Naija<span style={{ color: "#FFCC00" }}>Speed</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: "4px" }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "6px 14px", borderRadius: "8px",
              fontSize: "0.85rem", fontWeight: "500",
              textDecoration: "none",
              background: pathname === link.href ? "#FFCC00" : "transparent",
              color: pathname === link.href ? "black" : "#6B7280",
              transition: "all 0.2s ease",
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
