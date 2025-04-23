"use client";
import React, { useState } from "react";

export default function ProgramEditor({ program, setProgram, onSave }) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState("");
  const [repeatForAllDays, setRepeatForAllDays] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Pazartesi");

  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  function addExercise() {
    if (!exerciseName) return;
    setExercises((prev) => [
      ...prev,
      repeatForAllDays
        ? days.map((day, i) => ({ day, name: exerciseName, done: false, id: `${exerciseName}-${i}-${Date.now()}` }))
        : { day: selectedDay, name: exerciseName, done: false, id: `${exerciseName}-${selectedDay}-${Date.now()}` },
    ].flat());
    setExerciseName("");
  }

  function saveProgram() {
    setProgram({ title, exercises, repeatForAllDays });
    if (onSave) onSave({ title, exercises, repeatForAllDays });
    setTitle("");
    setExercises([]);
  }

  return (
    <div className="card" style={{ marginBottom: 24, background: "#18181b", color: "#fff" }}>
      <h3>Program Oluştur</h3>
      <input
        placeholder="Program başlığı (ör: Evde Spor)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ background: "#222", color: "#fff", border: "1px solid #333", marginBottom: 8 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="Egzersiz adı (ör: 5 şınav)"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
          style={{ background: "#222", color: "#fff", border: "1px solid #333" }}
        />
        <button onClick={addExercise} style={{ background: "#4ade80", color: "#18181b" }}>Ekle</button>
      </div>
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={repeatForAllDays}
            onChange={() => setRepeatForAllDays(!repeatForAllDays)}
            style={{ marginRight: 6 }}
          />
          Her güne aynı programı uygula
        </label>
        {!repeatForAllDays && (
          <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ background: "#222", color: "#fff", border: "1px solid #333" }}>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        )}
      </div>
      <ul style={{ margin: 0, padding: 0 }}>
        {exercises.map((ex, i) => (
          <li key={ex.id} style={{ marginBottom: 4, fontSize: 15 }}>
            {ex.day}: {ex.name}
          </li>
        ))}
      </ul>
      <button style={{ marginTop: 10, background: "#4ade80", color: "#18181b" }} onClick={saveProgram}>Programı Kaydet</button>
    </div>
  );
}
