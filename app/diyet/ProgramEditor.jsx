"use client";
import React, { useState } from "react";

export default function DiyetProgramEditor({ program, setProgram, onSave }) {
  const [title, setTitle] = useState("");
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [repeatForAllDays, setRepeatForAllDays] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Pazartesi");

  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  function addMeal() {
    if (!mealName) return;
    setMeals((prev) => [
      ...prev,
      repeatForAllDays
        ? days.map((day, i) => ({ day, name: mealName, done: false, id: `${mealName}-${i}-${Date.now()}` }))
        : { day: selectedDay, name: mealName, done: false, id: `${mealName}-${selectedDay}-${Date.now()}` },
    ].flat());
    setMealName("");
  }

  function saveProgram() {
    setProgram({ title, meals, repeatForAllDays });
    if (onSave) onSave({ title, meals, repeatForAllDays });
    setTitle("");
    setMeals([]);
  }

  return (
    <div className="card" style={{ marginBottom: 24, background: "#18181b", color: "#fff" }}>
      <h3>Diyet Programı Oluştur</h3>
      <input
        placeholder="Program başlığı (ör: Diyet 1)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ background: "#222", color: "#fff", border: "1px solid #333", marginBottom: 8 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="Öğün adı (ör: Kahvaltı)"
          value={mealName}
          onChange={e => setMealName(e.target.value)}
          style={{ background: "#222", color: "#fff", border: "1px solid #333" }}
        />
        <button onClick={addMeal} style={{ background: "#4ade80", color: "#18181b" }}>Ekle</button>
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
        {meals.map((meal, i) => (
          <li key={meal.id} style={{ marginBottom: 4, fontSize: 15 }}>
            {meal.day}: {meal.name}
          </li>
        ))}
      </ul>
      <button style={{ marginTop: 10, background: "#4ade80", color: "#18181b" }} onClick={saveProgram}>Programı Kaydet</button>
    </div>
  );
}
