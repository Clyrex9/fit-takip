"use client";
import Navbar from "../../components/Navbar";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import ProgramEditor from "./ProgramEditor";
import WeeklySportProgram from "./WeeklySportProgram";

export default function SporPage() {
  const [checked, setChecked] = useState({});
  const [user, setUser] = useState(null);
  const [program, setProgram] = useState(null);
  const [weekProgram, setWeekProgram] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "programs", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProgram(snap.data());
          setWeekProgram(snap.data().week ? snap.data() : null);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function saveProgram(newProgram) {
    if (!user) return;
    await setDoc(doc(db, "programs", user.uid), newProgram);
    setProgram(newProgram);
    setWeekProgram(newProgram.week ? newProgram : null);
  }

  function toggleExercise(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return <div className="container">Yükleniyor...</div>;

  // Tam güvenli map: weekProgram ve weekProgram.week yoksa veya hatalıysa boş array göster
  const safeWeek = Array.isArray(weekProgram?.week) ? weekProgram.week : [];

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 style={{ color: "#fff" }}>Spor Takip</h2>
        <button
          onClick={() => setEditMode(e => !e)}
          style={{ marginBottom: 16, background: editMode ? "#18181b" : "#4ade80", color: editMode ? "#4ade80" : "#18181b", border: "1px solid #4ade80", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}
        >
          {editMode ? "Görüntüle" : "Düzenle"}
        </button>
        {((!weekProgram || !Array.isArray(weekProgram.week) || editMode)) && <WeeklySportProgram program={weekProgram} setProgram={saveProgram} />}
        {weekProgram && Array.isArray(weekProgram.week) && !editMode && (
          <div className="card" style={{ background: "#18181b", color: "#fff", marginBottom: 24 }}>
            <h3>Spor Programı (Haftalık)</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {safeWeek.map((d, i) => (
                <div key={d?.day || i} style={{ minWidth: 180, background: "#222", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>{d?.day || "-"}</div>
                  <ul style={{ padding: 0, margin: 0 }}>
                    {Array.isArray(d?.exercises) && d.exercises.length === 0 && <li style={{ color: "#aaa" }}>Egzersiz eklenmedi</li>}
                    {Array.isArray(d?.exercises) && d.exercises.map((e, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        {e?.name || "-"} <span style={{ color: "#aaa", fontSize: 13 }}>({e?.desc || "-"})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Eski programı tamamen gizle, asla göstermeye çalışma */}
        {/* !program && <ProgramEditor program={program} setProgram={setProgram} onSave={saveProgram} /> */}
        {/* program && (
          <div className="card">
            <h3>{program.title}</h3>
            <ul style={{ padding: 0, margin: 0, width: "100%" }}>
              {program.exercises.map((ex) => (
                <li key={ex.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={checked[ex.id] || false}
                    onChange={() => toggleExercise(ex.id)}
                    style={{ width: 20, height: 20, marginRight: 12 }}
                  />
                  <span style={{ fontSize: 17 }}>{ex.day}: {ex.name}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 14, color: "#4ade80", fontWeight: 500 }}>
              {program.exercises.every((ex) => checked[ex.id]) ? "Tebrikler, bugünkü spor tamamlandı!" : "Spor programını tamamlamak için tüm tikleri işaretle."}
            </div>
          </div>
        ) */}
      </div>
    </>
  );
}
