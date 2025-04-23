"use client";
import Navbar from "../../components/Navbar";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import WeightChart from "./WeightChart";
import CalendarProgress from "./CalendarProgress";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [boy, setBoy] = useState("");
  const [kilo, setKilo] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [doneDays, setDoneDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "profiles", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBoy(data.boy || "");
          setKilo(data.kilo || "");
          setWeightHistory(data.weightHistory || []);
          setDoneDays(data.doneDays || {});
          setPhoto(data.photoURL || u.photoURL || "");
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function saveProfile() {
    if (!user) return;
    await setDoc(doc(db, "profiles", user.uid), {
      boy,
      kilo,
      weightHistory,
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
    });
    alert("Profil kaydedildi!");
  }

  async function addWeightEntry() {
    if (!user || !kilo) return;
    const today = new Date().toLocaleDateString("tr-TR", { month: "2-digit", day: "2-digit" });
    const entry = { value: Number(kilo), date: today };
    const newHistory = [...weightHistory, entry];
    setWeightHistory(newHistory);
    await updateDoc(doc(db, "profiles", user.uid), {
      weightHistory: arrayUnion(entry),
      kilo: kilo,
    });
  }

  async function clearWeightHistory() {
    if (!user) return;
    setWeightHistory([]);
    await updateDoc(doc(db, "profiles", user.uid), {
      weightHistory: [],
    });
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    // Firebase Storage'a yükle
    const storageUrl = `https://api.imgbb.com/1/upload?key=4c51f95dedfe63ce71c1892490e38a31`; 
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(storageUrl, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      setPhoto(data.data.url);
      await updateDoc(doc(db, "profiles", user.uid), { photoURL: data.data.url });
      alert("Profil fotoğrafı güncellendi!");
    } else {
      alert("Fotoğraf yüklenemedi!");
    }
    setUploading(false);
  }

  if (!user || loading) return null;

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Profil</h2>
        <img src={photo || user.photoURL} alt="Profil" style={{ borderRadius: "50%", width: 100, height: 100, marginBottom: 16 }} />
        <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ marginBottom: 12 }} />
        {uploading && <div>Yükleniyor...</div>}
        <div style={{ fontSize: 18, marginBottom: 8 }}>Ad: {user.displayName}</div>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Email: {user.email}</div>
        <CalendarProgress doneDays={doneDays} />
        <form onSubmit={e => { e.preventDefault(); saveProfile(); }} style={{ width: "100%", marginTop: 12 }}>
          <div>
            <label>Boy (cm):</label>
            <input value={boy} onChange={e => setBoy(e.target.value)} type="number" min="100" max="250" />
          </div>
          <div>
            <label>Kilo (kg):</label>
            <input value={kilo} onChange={e => setKilo(e.target.value)} type="number" min="30" max="300" />
            <button type="button" onClick={addWeightEntry} style={{ marginLeft: 8 }}>Kilo Kaydet (Grafiğe ekle)</button>
          </div>
          <button type="submit">Profili Kaydet</button>
        </form>
        <WeightChart data={weightHistory.slice(-14)} />
        <button type="button" onClick={clearWeightHistory} style={{ marginTop: 12, background: "#f87171", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>Kilo İstatistiğini Sıfırla</button>
      </div>
    </>
  );
}
