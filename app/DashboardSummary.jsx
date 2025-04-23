"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function DashboardSummary() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayDiet, setTodayDiet] = useState([]);
  const [todaySport, setTodaySport] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState("");
  const [successRate, setSuccessRate] = useState(0);
  const [dietDone, setDietDone] = useState(false);
  const [sportDone, setSportDone] = useState(false);
  const [todayKey, setTodayKey] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const today = new Date();
        const todayStr = today.toLocaleDateString("tr-TR");
        setTodayKey(todayStr);
        const profileRef = doc(db, "profiles", u.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
          setWeightHistory(profileSnap.data().weightHistory || []);
          // Tamamlananlar
          const done = profileSnap.data().doneDays || {};
          setDietDone(done[todayStr]?.diet || false);
          setSportDone(done[todayStr]?.sport || false);
        }
        // Diyet programı
        const dietSnap = await getDoc(doc(db, "diyetPrograms", u.uid));
        if (dietSnap.exists()) {
          const day = today.toLocaleDateString("tr-TR", { weekday: "long" });
          setTodayDiet((dietSnap.data().week || []).find(d => d.day === day)?.meals || []);
        }
        // Spor programı
        const sportSnap = await getDoc(doc(db, "programs", u.uid));
        if (sportSnap.exists()) {
          const day = today.toLocaleDateString("tr-TR", { weekday: "long" });
          setTodaySport((sportSnap.data().week || []).find(d => d.day === day)?.exercises || []);
        }
        // Motivasyon sözü
        const motivs = [
          "Başarı, küçük alışkanlıkların toplamıdır.",
          "Bugün başla, yarın farkı gör.",
          "Her gün bir adım daha ileri!",
          "İmkansız, sadece biraz daha zaman alır.",
        ];
        setMotivation(motivs[Math.floor(Math.random() * motivs.length)]);
        setSuccessRate(Math.floor(Math.random()*30)+70); // Placeholder
        setLoading(false);
      } else {
        setLoading(false); // Kullanıcı yoksa da loading'i kapat!
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleDone(type) {
    if (!user || !todayKey) return;
    const profileRef = doc(db, "profiles", user.uid);
    const snap = await getDoc(profileRef);
    let doneDays = (snap.exists() && snap.data().doneDays) || {};
    if (!doneDays[todayKey]) doneDays[todayKey] = {};
    doneDays[todayKey][type] = true;
    await setDoc(profileRef, { ...snap.data(), doneDays }, { merge: true });
    if (type === "diet") setDietDone(true);
    if (type === "sport") setSportDone(true);
  }

  if (!user && !loading) {
    router.replace("/login");
    return null;
  }

  if (loading) return <div className="card" style={{ marginTop: 32 }}>Yükleniyor...</div>;

  return (
    <div className="card" style={{ maxWidth: 480, margin: "32px auto", background: "#18181b", color: "#fff" }}>
      <h2 style={{ color: "#4ade80", textAlign: "center" }}>Hoşgeldin, {profile?.displayName || ""}!</h2>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={profile?.photoURL} alt="Profil" style={{ borderRadius: "50%", width: 70, height: 70, margin: "8px auto" }} />
      </div>
      <div style={{ fontWeight: 500, marginBottom: 8, textAlign: "center" }}>
        <div style={{ marginBottom: 6 }}>
          <span>Bugünkü Diyet: {todayDiet.length ? todayDiet.map(m => m.name).join(", ") : "Tanımlı değil"}</span>
          {todayDiet.length > 0 && (
            <button onClick={() => handleDone("diet")}
              style={{ marginLeft: 10, background: dietDone ? "#4ade80" : "#222", color: dietDone ? "#18181b" : "#fff", border: "1px solid #4ade80", borderRadius: 6, padding: "2px 10px", cursor: dietDone ? "default" : "pointer", fontWeight: 700, fontSize: 18 }}
              disabled={dietDone}
              title={dietDone ? "Tamamlandı" : "Bugünkü diyeti tamamladım"}
            >
              {dietDone ? "✓ Tamamlandı" : "✓ Tamamla"}
            </button>
          )}
        </div>
        <div>
          <span>Bugünkü Spor: {todaySport.length ? todaySport.map(e => e.name).join(", ") : "Tanımlı değil"}</span>
          {todaySport.length > 0 && (
            <button onClick={() => handleDone("sport")}
              style={{ marginLeft: 10, background: sportDone ? "#4ade80" : "#222", color: sportDone ? "#18181b" : "#fff", border: "1px solid #4ade80", borderRadius: 6, padding: "2px 10px", cursor: sportDone ? "default" : "pointer", fontWeight: 700, fontSize: 18 }}
              disabled={sportDone}
              title={sportDone ? "Tamamlandı" : "Bugünkü sporu tamamladım"}
            >
              {sportDone ? "✓ Tamamlandı" : "✓ Tamamla"}
            </button>
          )}
        </div>
      </div>
      <div style={{ margin: "12px 0", textAlign: "center" }}>
        <b>Kilo:</b> {profile?.kilo || "-"} kg &nbsp; <b>Boy:</b> {profile?.boy || "-"} cm
      </div>
      <div style={{ margin: "12px 0", textAlign: "center" }}>
        <b>Son Kilo Değişimi:</b> {weightHistory.length > 1 ? (weightHistory[weightHistory.length-1].value - weightHistory[0].value) + " kg" : "-"}
      </div>
      <div style={{ margin: "12px 0", textAlign: "center" }}>
        <b>Başarı Yüzdesi:</b> %{successRate}
      </div>
      <div style={{ margin: "16px 0", fontStyle: "italic", color: "#4ade80", textAlign: "center" }}>
        {motivation}
      </div>
    </div>
  );
}
