"use client";
import React from "react";

export default function WeightChart({ data }) {
  // Basit bir SVG line chart (dışa bağımlılık olmadan)
  if (!data || data.length === 0) {
    return <div style={{ color: '#aaa', marginTop: 24 }}>Henüz veri yok.</div>;
  }
  const width = 320;
  const height = 120;
  const minY = Math.min(...data.map(d => d.value));
  const maxY = Math.max(...data.map(d => d.value));
  const rangeY = maxY - minY || 1;
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * (width - 40) + 20;
    const y = height - 20 - ((d.value - minY) / rangeY) * (height - 40);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ background: '#18181b', borderRadius: 10, marginTop: 24 }}>
      <polyline
        fill="none"
        stroke="#4ade80"
        strokeWidth="3"
        points={points}
      />
      {data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((d.value - minY) / rangeY) * (height - 40);
        return <circle key={i} cx={x} cy={y} r={4} fill="#4ade80" />;
      })}
      {/* Y ekseni min ve max */}
      <text x={4} y={height - 20} fill="#aaa" fontSize={12}>{minY} kg</text>
      <text x={4} y={28} fill="#aaa" fontSize={12}>{maxY} kg</text>
      {/* X ekseni tarihleri */}
      {data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * (width - 40) + 20;
        return <text key={i} x={x} y={height - 2} fill="#aaa" fontSize={11} textAnchor="middle">{d.date}</text>;
      })}
    </svg>
  );
}
