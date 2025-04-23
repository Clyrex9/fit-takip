"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Anasayfa", href: "/" },
  { name: "Diyet Takip", href: "/diyet" },
  { name: "Spor Takip", href: "/spor" },
  { name: "Arkadaşlar", href: "/arkadaslar" },
  { name: "Profil", href: "/profil" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav style={{
      background: "#222", color: "#fff", padding: "12px 0", display: "flex", justifyContent: "center", gap: 24
    }}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}
          style={{
            color: pathname === item.href ? "#4ade80" : "#e5e5e5",
            textDecoration: "none", fontWeight: pathname === item.href ? "bold" : "normal", fontSize: 18,
            borderBottom: pathname === item.href ? "2px solid #4ade80" : "2px solid transparent",
            paddingBottom: 4, margin: "0 12px"
          }}>
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
