// Arkadaş profil kartında detaylı bilgi göstermek için yardımcı fonksiyonlar ve bileşenler burada olacak.
// (import ve kullanım için FriendList.jsx dosyasına eklenecek)

import React, { useState, useEffect } from "react";
import StatsSummary from "../profil/StatsSummary";
import CalendarProgress from "../profil/CalendarProgress";

// Grafiksel gösterim için basit görsel kartlar
function DietProgramCard({ program }) {
  if (!program || !program.week) return <div style={{ color: "#aaa", fontSize: 13 }}>Diyet programı bulunamadı.</div>;
  return (
    <div style={{ marginBottom: 12 }}>
      <b style={{ color: "#4ade80" }}>Diyet Programı</b>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {program.week.map((d, i) => (
          <div key={d.day} style={{ background: "#222", borderRadius: 8, padding: 6, fontSize: 14 }}>
            <b>{d.day}:</b> {d.meals.length === 0 ? <span style={{ color: "#aaa" }}>Öğün yok</span> : d.meals.map(m => m.name).join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}

function SportProgramCard({ program }) {
  if (!program || !program.week) return <div style={{ color: "#aaa", fontSize: 13 }}>Spor programı bulunamadı.</div>;
  return (
    <div style={{ marginBottom: 12 }}>
      <b style={{ color: "#4ade80" }}>Spor Programı</b>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {program.week.map((d, i) => (
          <div key={d.day} style={{ background: "#222", borderRadius: 8, padding: 6, fontSize: 14 }}>
            <b>{d.day}:</b> {d.exercises.length === 0 ? <span style={{ color: "#aaa" }}>Egzersiz yok</span> : d.exercises.map(e => e.name).join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FriendProfileDetail({ profile }) {
  const [tab, setTab] = useState("summary");
  const [dietProgram, setDietProgram] = useState(null);
  const [sportProgram, setSportProgram] = useState(null);
  const [loading, setLoading] = useState(false);

  // Programları sadece ilgili tab açılınca getir
  async function fetchProgramsIfNeeded() {
    if (dietProgram && sportProgram) return;
    setLoading(true);
    try {
      const { db } = await import("../../lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");
      if (profile.uid) {
        const dietRef = doc(db, "diyetPrograms", profile.uid);
        const dietSnap = await getDoc(dietRef);
        if (dietSnap.exists()) setDietProgram(dietSnap.data());
        const sporRef = doc(db, "programs", profile.uid);
        const sporSnap = await getDoc(sporRef);
        if (sporSnap.exists()) setSportProgram(sporSnap.data());
      }
    } catch {}
    setLoading(false);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
        <button onClick={() => setTab("summary")}
          style={{ background: tab === "summary" ? "#4ade80" : "#222", color: tab === "summary" ? "#18181b" : "#fff", border: 0, borderRadius: 6, padding: "4px 14px", cursor: "pointer" }}>
          Başarı
        </button>
        <button onClick={() => setTab("calendar")}
          style={{ background: tab === "calendar" ? "#4ade80" : "#222", color: tab === "calendar" ? "#18181b" : "#fff", border: 0, borderRadius: 6, padding: "4px 14px", cursor: "pointer" }}>
          Takvim
        </button>
        <button onClick={async () => { setTab("program"); await fetchProgramsIfNeeded(); }}
          style={{ background: tab === "program" ? "#4ade80" : "#222", color: tab === "program" ? "#18181b" : "#fff", border: 0, borderRadius: 6, padding: "4px 14px", cursor: "pointer" }}>
          Programlar
        </button>
      </div>
      <div style={{ minHeight: 80, maxHeight: 350, overflow: "auto", transition: "all .2s" }}>
        {tab === "summary" && (
          <StatsSummary doneDays={profile.doneDays || {}} month={new Date().getMonth()} year={new Date().getFullYear()} />
        )}
        {tab === "calendar" && (
          <div style={{ margin: "0 auto", maxWidth: 350 }}>
            <CalendarProgress doneDays={profile.doneDays || {}} />
          </div>
        )}
        {tab === "program" && (
          loading ? <div style={{ color: "#aaa", textAlign: "center" }}>Yükleniyor...</div> :
          <>
            <DietProgramCard program={dietProgram} />
            <SportProgramCard program={sportProgram} />
          </>
        )}
      </div>
    </div>
  );
}
