"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";

export default function FriendList() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendProgress, setFriendProgress] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "friends", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setFriends(snap.data().list || []);
      }
    });
    return () => unsubscribe();
  }, []);

  async function addFriend() {
    setError("");
    if (!friendEmail || !user) return;
    if (friendEmail === user.email) { setError("Kendi emailini ekleyemezsin."); return; }
    // Kullanıcı var mı kontrolü
    const q = query(collection(db, "profiles"), where("email", "==", friendEmail));
    const qs = await getDocs(q);
    if (qs.empty) { setError("Kullanıcı bulunamadı."); return; }
    // Arkadaş listesine ekle
    const ref = doc(db, "friends", user.uid);
    const snap = await getDoc(ref);
    let newList = [];
    if (snap.exists()) {
      newList = snap.data().list || [];
      if (newList.includes(friendEmail)) { setError("Zaten arkadaşsın."); return; }
    }
    newList.push(friendEmail);
    await setDoc(ref, { list: newList });
    setFriends(newList);
    setFriendEmail("");
  }

  async function fetchFriendProgress(email) {
    // Arkadaşın spor ve diyet programı ve ilerlemesi
    const q = query(collection(db, "profiles"), where("email", "==", email));
    const qs = await getDocs(q);
    let profile = null;
    if (!qs.empty) profile = qs.docs[0].data();
    const userSnap = await getDocs(query(collection(db, "programs")));
    let program = null;
    userSnap.forEach(doc => { if (doc.id === qs.docs[0].id) program = doc.data(); });
    setFriendProgress({ ...friendProgress, [email]: { profile, program } });
  }

  return (
    <div className="card" style={{ width: 350, margin: "0 auto", marginTop: 24 }}>
      <h3>Arkadaş Ekle</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Arkadaş email"
          value={friendEmail}
          onChange={e => setFriendEmail(e.target.value)}
        />
        <button onClick={addFriend}>Ekle</button>
      </div>
      {error && <div style={{ color: "#f87171", marginTop: 6 }}>{error}</div>}
      <hr style={{ margin: "16px 0", borderColor: "#222" }} />
      <h4>Arkadaşlarım</h4>
      <ul style={{ padding: 0, margin: 0 }}>
        {friends.length === 0 && <li style={{ color: "#aaa" }}>Henüz arkadaşın yok.</li>}
        {friends.map(email => (
          <li key={email} style={{ marginBottom: 8 }}>
            <span>{email}</span>
            <button style={{ marginLeft: 8 }} onClick={() => fetchFriendProgress(email)}>İlerlemesini Gör</button>
            {friendProgress[email] && (
              <div style={{ marginTop: 8, background: "#18181b", borderRadius: 8, padding: 10 }}>
                <div><b>{friendProgress[email].profile?.displayName}</b></div>
                <div>Kilo: {friendProgress[email].profile?.kilo} kg</div>
                <div>Boy: {friendProgress[email].profile?.boy} cm</div>
                <div>Program: {friendProgress[email].program?.title || "-"}</div>
                <div>Egzersizler: {friendProgress[email].program?.exercises?.map(e => e.name).join(", ") || "-"}</div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
