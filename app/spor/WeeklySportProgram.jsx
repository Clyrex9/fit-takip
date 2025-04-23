"use client";
import React, { useState } from "react";

const initialWeek = [
  { day: "Pazartesi", exercises: [] },
  { day: "Salı", exercises: [] },
  { day: "Çarşamba", exercises: [] },
  { day: "Perşembe", exercises: [] },
  { day: "Cuma", exercises: [] },
  { day: "Cumartesi", exercises: [] },
  { day: "Pazar", exercises: [] },
];

export default function WeeklySportProgram({ program, setProgram }) {
  // program?.week bir dizi değilse, her zaman initialWeek ile başla
  const [week, setWeek] = useState(Array.isArray(program?.week) ? program.week : initialWeek);
  const [selectedDay, setSelectedDay] = useState(week[0].day);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDesc, setExerciseDesc] = useState("");
  const [editing, setEditing] = useState({ day: null, idx: null });

  function addExercise() {
    if (!exerciseName) return;
    setWeek(w => w.map(d =>
      d.day === selectedDay
        ? { ...d, exercises: [...d.exercises, { name: exerciseName, desc: exerciseDesc }] }
        : d
    ));
    setExerciseName("");
    setExerciseDesc("");
  }

  function removeExercise(day, idx) {
    setWeek(w => w.map(d =>
      d.day === day
        ? { ...d, exercises: d.exercises.filter((_, i) => i !== idx) }
        : d
    ));
  }

  function startEdit(day, idx) {
    setEditing({ day, idx });
    const ex = week.find(d => d.day === day).exercises[idx];
    setExerciseName(ex.name);
    setExerciseDesc(ex.desc);
  }

  function saveEdit() {
    setWeek(w => w.map(d =>
      d.day === editing.day
        ? { ...d, exercises: d.exercises.map((e, i) => i === editing.idx ? { name: exerciseName, desc: exerciseDesc } : e) }
        : d
    ));
    setEditing({ day: null, idx: null });
    setExerciseName("");
    setExerciseDesc("");
  }

  function copyDay(fromDay, toDay) {
    const from = week.find(d => d.day === fromDay);
    setWeek(w => w.map(d => d.day === toDay ? { ...d, exercises: [...from.exercises] } : d));
  }

  React.useEffect(() => {
    setProgram({ week });
  }, [week, setProgram]);

  return (
    <div className="card" style={{ background: "#18181b", color: "#fff", marginBottom: 24 }}>
      <h3>Spor Programı (Haftalık)</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ background: "#222", color: "#fff" }}>
          {week.map(d => <option key={d.day} value={d.day}>{d.day}</option>)}
        </select>
        <input
          placeholder="Egzersiz adı (ör: Şınav)"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
          style={{ background: "#222", color: "#fff" }}
        />
        <input
          placeholder="Açıklama (ör: 3 set 10 tekrar)"
          value={exerciseDesc}
          onChange={e => setExerciseDesc(e.target.value)}
          style={{ background: "#222", color: "#fff" }}
        />
        {editing.day !== null ? (
          <button onClick={saveEdit} style={{ background: "#4ade80", color: "#18181b" }}>Kaydet</button>
        ) : (
          <button onClick={addExercise} style={{ background: "#4ade80", color: "#18181b" }}>Ekle</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {week.map((d, i) => (
          <div key={d.day} style={{ minWidth: 180, background: "#222", borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>{d.day}</div>
            <ul style={{ padding: 0, margin: 0 }}>
              {d.exercises.length === 0 && <li style={{ color: "#aaa" }}>Egzersiz eklenmedi</li>}
              {d.exercises.map((e, idx) => (
                <li key={idx} style={{ marginBottom: 4, display: "flex", alignItems: "center" }}>
                  <span style={{ flex: 1 }}>{e.name} <span style={{ color: "#aaa", fontSize: 13 }}>({e.desc})</span></span>
                  <button style={{ marginLeft: 4, background: "#f87171", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => removeExercise(d.day, idx)}>Sil</button>
                  <button style={{ marginLeft: 4, background: "#4ade80", color: "#18181b", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => startEdit(d.day, idx)}>Düzenle</button>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 6 }}>
              {week.filter(wd => wd.day !== d.day).map(wd => (
                <button key={wd.day} style={{ fontSize: 11, marginRight: 4, background: "#333", color: "#fff", border: "1px solid #444", borderRadius: 4, padding: "2px 8px" }} onClick={() => copyDay(d.day, wd.day)}>
                  {d.day} → {wd.day} Kopyala
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
