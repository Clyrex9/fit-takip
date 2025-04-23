"use client";
import React from "react";
import StatsSummary from "./StatsSummary";

function getMonthDays(year, month) {
  // month: 0-indexed
  const date = new Date(year, month + 1, 0);
  return date.getDate();
}

function getDayKey(date) {
  return date.toLocaleDateString("tr-TR");
}

export default function CalendarProgress({ doneDays }) {
  const [month, setMonth] = React.useState(new Date().getMonth());
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [modal, setModal] = React.useState(null);
  const today = new Date();
  const daysInMonth = getMonthDays(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  function prevMonth() {
    setMonth(m => {
      if (m === 0) {
        setYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  }
  function nextMonth() {
    setMonth(m => {
      if (m === 11) {
        setYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  return (
    <div style={{ background: "#18181b", borderRadius: 14, padding: 20, color: "#fff", margin: "32px auto", maxWidth: 420 }}>
      <StatsSummary doneDays={doneDays} month={month} year={year} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>{"<"}</button>
        <h3 style={{ color: "#4ade80", textAlign: "center", margin: 0 }}>{year} - {month + 1}</h3>
        <button onClick={nextMonth} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>{">"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d, i) => (
          <div key={i} style={{ color: "#aaa", fontWeight: 600, textAlign: "center" }}>{d}</div>
        ))}
        {days.map((date, idx) => {
          const key = getDayKey(date);
          const info = doneDays?.[key] || {};
          const isToday = key === getDayKey(today);
          const allDone = info.diet && info.sport;
          const someDone = info.diet || info.sport;
          return (
            <div key={key}
              style={{
                background: isToday ? "#4ade80" : allDone ? "#22d3ee" : someDone ? "#fde68a" : "#222",
                color: isToday ? "#18181b" : allDone ? "#18181b" : someDone ? "#b45309" : "#aaa",
                borderRadius: 8,
                minHeight: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: isToday ? 700 : 500,
                border: isToday ? "2px solid #fff" : "1px solid #333",
                fontSize: 16,
                position: "relative",
                cursor: "pointer"
              }}
              title={
                isToday ? "Bugün" :
                allDone ? "Diyet ve spor tamamlandı" :
                someDone ? (info.diet ? "Diyet tamamlandı" : "") + (info.sport ? " Spor tamamlandı" : "") :
                ""
              }
              onClick={() => setModal({ date: key, info })}
            >
              {date.getDate()}
              {allDone && <span style={{ position: "absolute", top: 2, right: 4, fontSize: 15 }}>✓</span>}
              {!allDone && someDone && <span style={{ position: "absolute", top: 2, right: 4, fontSize: 15, color: "#b45309" }}>✓</span>}
            </div>
          );
        })}
      </div>
      {modal && (
        <div style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "#000a", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModal(null)}>
          <div style={{ background: "#222", color: "#fff", borderRadius: 16, padding: 28, minWidth: 260, minHeight: 120, boxShadow: "0 4px 32px #0008", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{modal.date}</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>
              {modal.info.diet && modal.info.sport && <span style={{ color: "#4ade80" }}>Diyet ve spor tamamlandı!</span>}
              {modal.info.diet && !modal.info.sport && <span style={{ color: "#22d3ee" }}>Sadece diyet tamamlandı.</span>}
              {!modal.info.diet && modal.info.sport && <span style={{ color: "#fde68a", color: "#b45309" }}>Sadece spor tamamlandı.</span>}
              {!modal.info.diet && !modal.info.sport && <span style={{ color: "#aaa" }}>Hiçbir görev tamamlanmadı.</span>}
            </div>
            <button onClick={() => setModal(null)} style={{ position: "absolute", top: 12, right: 16, background: "none", color: "#fff", border: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 18, fontSize: 14, color: "#aaa", textAlign: "center" }}>
        <span style={{ marginRight: 10 }}><span style={{ background: "#22d3ee", borderRadius: 4, padding: "0 6px" }}>✓</span> Diyet+Spor</span>
        <span style={{ marginRight: 10 }}><span style={{ background: "#fde68a", borderRadius: 4, padding: "0 6px", color: "#b45309" }}>✓</span> Yalnızca biri</span>
        <span><span style={{ background: "#4ade80", borderRadius: 4, padding: "0 6px", color: "#18181b" }}>Bugün</span></span>
      </div>
    </div>
  );
}
