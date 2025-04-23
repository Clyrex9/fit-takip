"use client";
import Navbar from "../../components/Navbar";
import React, { useState, useEffect } from "react";
import WeeklyDietProgram from "./WeeklyDietProgram";
import { db, auth } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function DiyetPage() {
  const [checked, setChecked] = useState({});
  const [user, setUser] = useState(null);
  const [program, setProgram] = useState(null);
  const [weekProgram, setWeekProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "diyetPrograms", u.uid);
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
    await setDoc(doc(db, "diyetPrograms", user.uid), newProgram);
    setProgram(newProgram);
    setWeekProgram(newProgram.week ? newProgram : null);
  }

  function toggleMeal(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return <div className="container">Yükleniyor...</div>;

  return (
    <>
      <Navbar />
      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 60 }}>
        <h2 style={{ color: "#fff" }}>Diyet Takip</h2>
        <button
          onClick={() => setEditMode(e => !e)}
          style={{ marginBottom: 16, background: editMode ? "#18181b" : "#4ade80", color: editMode ? "#4ade80" : "#18181b", border: "1px solid #4ade80", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}
        >
          {editMode ? "Görüntüle" : "Düzenle"}
        </button>
        {(!weekProgram || editMode) && <WeeklyDietProgram program={weekProgram} setProgram={saveProgram} />}
        {weekProgram && !editMode && (
          <div className="card" style={{ background: "#18181b", color: "#fff", marginBottom: 24 }}>
            <h3>Diyet Programı (Haftalık)</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {weekProgram.week.map((d, i) => (
                <div key={d.day} style={{ minWidth: 180, background: "#222", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>{d.day}</div>
                  <ul style={{ padding: 0, margin: 0 }}>
                    {d.meals.length === 0 && <li style={{ color: "#aaa" }}>Öğün eklenmedi</li>}
                    {d.meals.map((m, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        {m.name} <span style={{ color: "#aaa", fontSize: 13 }}>({m.desc})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
