"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Salad, Dumbbell, Users, User } from "lucide-react";

const navItems = [
  { name: "Anasayfa", href: "/", icon: Home },
  { name: "Diyet", href: "/diyet", icon: Salad },
  { name: "Spor", href: "/spor", icon: Dumbbell },
  { name: "Arkadaşlar", href: "/arkadaslar", icon: Users },
  { name: "Profil", href: "/profil", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        minHeight: 80,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
        boxShadow: "none",
        border: "none",
        padding: 0
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none", margin: "0 18px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                boxShadow: "none",
                border: "none"
              }}
            >
              <Icon
                size={38}
                color={isActive ? "#4ade80" : "#cbd5e1"}
                fill={isActive ? "#4ade80" : "none"}
                style={{
                  borderRadius: "50%",
                  background: "none",
                  transition: "color 0.2s, background 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#4ade80")}
                onMouseLeave={e => (e.currentTarget.style.color = isActive ? "#4ade80" : "#cbd5e1")}
              />
              <span
                style={{
                  color: isActive ? "#4ade80" : "#e5e5e5",
                  fontWeight: isActive ? "bold" : "normal",
                  fontSize: 16,
                  marginTop: 2
                }}
              >
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
