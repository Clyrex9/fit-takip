"use client";
import React, { useState } from "react";

const initialWeek = [
  { day: "Pazartesi", meals: [] },
  { day: "Salı", meals: [] },
  { day: "Çarşamba", meals: [] },
  { day: "Perşembe", meals: [] },
  { day: "Cuma", meals: [] },
  { day: "Cumartesi", meals: [] },
  { day: "Pazar", meals: [] },
];

export default function WeeklyDietProgram({ program, setProgram }) {
  const [week, setWeek] = useState(program?.week || initialWeek);
  const [selectedDay, setSelectedDay] = useState(week[0].day);
  const [mealName, setMealName] = useState("");
  const [mealDesc, setMealDesc] = useState("");
  const [editing, setEditing] = useState({ day: null, idx: null });

  function addMeal() {
    if (!mealName) return;
    setWeek(w => w.map(d =>
      d.day === selectedDay
        ? { ...d, meals: [...d.meals, { name: mealName, desc: mealDesc }] }
        : d
    ));
    setMealName("");
    setMealDesc("");
  }

  function removeMeal(day, idx) {
    setWeek(w => w.map(d =>
      d.day === day
        ? { ...d, meals: d.meals.filter((_, i) => i !== idx) }
        : d
    ));
  }

  function startEdit(day, idx) {
    setEditing({ day, idx });
    const meal = week.find(d => d.day === day).meals[idx];
    setMealName(meal.name);
    setMealDesc(meal.desc);
  }

  function saveEdit() {
    setWeek(w => w.map(d =>
      d.day === editing.day
        ? { ...d, meals: d.meals.map((m, i) => i === editing.idx ? { name: mealName, desc: mealDesc } : m) }
        : d
    ));
    setEditing({ day: null, idx: null });
    setMealName("");
    setMealDesc("");
  }

  function copyDay(fromDay, toDay) {
    const from = week.find(d => d.day === fromDay);
    setWeek(w => w.map(d => d.day === toDay ? { ...d, meals: [...from.meals] } : d));
  }

  // Program güncellendiğinde üst component'e bildir
  React.useEffect(() => {
    setProgram({ week });
  }, [week, setProgram]);

  return (
    <div className="card" style={{ background: "#18181b", color: "#fff", marginBottom: 24 }}>
      <h3>Diyet Programı (Haftalık)</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ background: "#222", color: "#fff" }}>
          {week.map(d => <option key={d.day} value={d.day}>{d.day}</option>)}
        </select>
        <input
          placeholder="Öğün adı (ör: Kahvaltı)"
          value={mealName}
          onChange={e => setMealName(e.target.value)}
          style={{ background: "#222", color: "#fff" }}
        />
        <input
          placeholder="Açıklama (ör: 3 yumurta)"
          value={mealDesc}
          onChange={e => setMealDesc(e.target.value)}
          style={{ background: "#222", color: "#fff" }}
        />
        {editing.day !== null ? (
          <button onClick={saveEdit} style={{ background: "#4ade80", color: "#18181b" }}>Kaydet</button>
        ) : (
          <button onClick={addMeal} style={{ background: "#4ade80", color: "#18181b" }}>Ekle</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {week.map((d, i) => (
          <div key={d.day} style={{ minWidth: 180, background: "#222", borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>{d.day}</div>
            <ul style={{ padding: 0, margin: 0 }}>
              {d.meals.length === 0 && <li style={{ color: "#aaa" }}>Öğün eklenmedi</li>}
              {d.meals.map((m, idx) => (
                <li key={idx} style={{ marginBottom: 4, display: "flex", alignItems: "center" }}>
                  <span style={{ flex: 1 }}>{m.name} <span style={{ color: "#aaa", fontSize: 13 }}>({m.desc})</span></span>
                  <button style={{ marginLeft: 4, background: "#f87171", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => removeMeal(d.day, idx)}>Sil</button>
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
