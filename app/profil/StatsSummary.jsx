"use client";
import React from "react";

function getStats(doneDays, month, year) {
  let total = 0, both = 0, diet = 0, sport = 0;
  for (const key in doneDays) {
    const [gun, ay, yil] = key.split(".");
    if (+yil === year && +ay === month + 1) {
      const d = doneDays[key];
      if (d.diet) diet++;
      if (d.sport) sport++;
      if (d.diet && d.sport) both++;
      total++;
    }
  }
  return { total, both, diet, sport };
}

export default function StatsSummary({ doneDays, month, year }) {
  const stats = getStats(doneDays, month, year);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const percent = daysInMonth ? Math.round((stats.both / daysInMonth) * 100) : 0;
  return (
    <div style={{ background: "#222", color: "#fff", borderRadius: 12, margin: "18px 0", padding: 16, textAlign: "center" }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Başarı Özeti</div>
      <div style={{ fontSize: 15, marginBottom: 4 }}>
        <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 20 }}>{percent}%</span> &nbsp;Bu ay hem diyet hem spor tamamlanan gün oranı
      </div>
      <div style={{ fontSize: 14, color: "#aaa" }}>
        <span style={{ color: "#22d3ee" }}>{stats.both}</span> gün diyet+spor &nbsp;|
        <span style={{ color: "#fde68a", marginLeft: 8 }}>{stats.diet}</span> gün diyet &nbsp;|
        <span style={{ color: "#fde68a", marginLeft: 8 }}>{stats.sport}</span> gün spor
      </div>
    </div>
  );
}
