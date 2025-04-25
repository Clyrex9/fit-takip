"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";
import FriendProfileDetail from "./FriendProfileDetail";

export default function FriendList() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendInput, setFriendInput] = useState("");
  const [searchType, setSearchType] = useState("email"); // "email" veya "displayName"
  const [friendProgress, setFriendProgress] = useState({});
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(null);

  // Arkadaşların displayName'lerini almak için yardımcı fonksiyon
  async function getDisplayNameByEmail(email) {
    const q = query(collection(db, "profiles"), where("email", "==", email));
    const qs = await getDocs(q);
    if (!qs.empty) {
      return qs.docs[0].data().displayName || email;
    }
    return email;
  }

  // Arkadaşların displayName'lerini state olarak tut
  const [friendNames, setFriendNames] = useState({});

  // Arkadaşlar güncellendiğinde displayName'leri çek
  useEffect(() => {
    async function fetchNames() {
      let names = {};
      for (const email of friends) {
        names[email] = await getDisplayNameByEmail(email);
      }
      setFriendNames(names);
    }
    if (friends.length > 0) fetchNames();
  }, [friends]);

  // Bekleyen istekler için de displayName'leri çek
  const [pendingNames, setPendingNames] = useState({});
  useEffect(() => {
    async function fetchPendingNames() {
      let names = {};
      for (const email of pendingRequests) {
        names[email] = await getDisplayNameByEmail(email);
      }
      setPendingNames(names);
    }
    if (pendingRequests.length > 0) fetchPendingNames();
  }, [pendingRequests]);

  // Gelen istekler için de displayName'leri çek
  const [requestNames, setRequestNames] = useState({});
  useEffect(() => {
    async function fetchRequestNames() {
      let names = {};
      for (const email of friendRequests) {
        names[email] = await getDisplayNameByEmail(email);
      }
      setRequestNames(names);
    }
    if (friendRequests.length > 0) fetchRequestNames();
  }, [friendRequests]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "friends", u.uid);
        const snap = await getDoc(ref);
        let friendEmails = [];
        if (snap.exists()) {
          friendEmails = snap.data().list || [];
        }
        setFriends(friendEmails);
        // Gelen istekleri al
        const reqRef = doc(db, "friendRequests", u.uid);
        const reqSnap = await getDoc(reqRef);
        if (reqSnap.exists()) setFriendRequests(reqSnap.data().list || []);
        // Bekleyen (gönderilen ama kabul edilmemiş) istekler
        const pendRef = doc(db, "pendingRequests", u.uid);
        const pendSnap = await getDoc(pendRef);
        if (pendSnap.exists()) setPendingRequests(pendSnap.data().list || []);
      }
    });
    return () => unsubscribe();
  }, []);

  async function sendFriendRequest() {
    setError("");
    if (!friendInput || !user) return;
    if (
      friendInput === user.email ||
      friendInput === user.displayName
    ) {
      setError("Kendi bilgini ekleyemezsin.");
      return;
    }
    // Kullanıcıyı hem email hem displayName ile ara
    let qEmail = query(collection(db, "profiles"), where("email", "==", friendInput));
    let qName = query(collection(db, "profiles"), where("displayName", "==", friendInput));
    let qsEmail = await getDocs(qEmail);
    let qsName = await getDocs(qName);
    let targetDoc = null;
    if (!qsEmail.empty) {
      targetDoc = qsEmail.docs[0];
    } else if (!qsName.empty) {
      targetDoc = qsName.docs[0];
    }
    if (!targetDoc) {
      setError("Kullanıcı bulunamadı.");
      return;
    }
    const targetUid = targetDoc.id;
    const targetEmail = targetDoc.data().email;
    // Zaten arkadaş mı?
    const ref = doc(db, "friends", user.uid);
    const snap = await getDoc(ref);
    let newList = [];
    if (snap.exists()) {
      newList = snap.data().list || [];
      if (newList.includes(targetEmail)) {
        setError("Zaten arkadaşsınız.");
        return;
      }
    }
    // Zaten istek gönderilmiş mi?
    const pendRef = doc(db, "pendingRequests", user.uid);
    const pendSnap = await getDoc(pendRef);
    let pendList = pendSnap.exists() ? pendSnap.data().list || [] : [];
    if (pendList.includes(targetEmail)) {
      setError("Zaten istek gönderdin.");
      return;
    }
    pendList.push(targetEmail);
    await setDoc(pendRef, { list: pendList });
    // Hedefin friendRequests'ine ekle
    const reqRef = doc(db, "friendRequests", targetUid);
    const reqSnap = await getDoc(reqRef);
    let reqList = reqSnap.exists() ? reqSnap.data().list || [] : [];
    reqList.push(user.email);
    await setDoc(reqRef, { list: reqList });
    setPendingRequests(pendList);
    setFriendInput("");
  }

  async function acceptFriendRequest(requester) {
    if (!user) return;
    // Her iki tarafın friends listesine ekle
    const myRef = doc(db, "friends", user.uid);
    const mySnap = await getDoc(myRef);
    let myList = mySnap.exists() ? mySnap.data().list || [] : [];
    if (!myList.includes(requester)) myList.push(requester);
    await setDoc(myRef, { list: myList });
    // Karşı tarafın friends listesine ekle
    const q = query(collection(db, "profiles"), where("email", "==", requester));
    const qs = await getDocs(q);
    if (!qs.empty) {
      const targetUid = qs.docs[0].id;
      const frRef = doc(db, "friends", targetUid);
      const frSnap = await getDoc(frRef);
      let frList = frSnap.exists() ? frSnap.data().list || [] : [];
      if (!frList.includes(user.email)) frList.push(user.email);
      await setDoc(frRef, { list: frList });
      // Karşı tarafın pendingRequests listesinden çıkar
      const pendRef = doc(db, "pendingRequests", targetUid);
      const pendSnap = await getDoc(pendRef);
      let pendList = pendSnap.exists() ? pendSnap.data().list || [] : [];
      pendList = pendList.filter(u => u !== user.email);
      await setDoc(pendRef, { list: pendList });
    }
    // Kendi friendRequests listesinden çıkar
    const reqRef = doc(db, "friendRequests", user.uid);
    const reqSnap = await getDoc(reqRef);
    let reqList = reqSnap.exists() ? reqSnap.data().list || [] : [];
    reqList = reqList.filter(u => u !== requester);
    await setDoc(reqRef, { list: reqList });
    setFriendRequests(reqList);
    setFriends(myList);
  }

  async function fetchFriendProgress(email) {
    const q = query(collection(db, "profiles"), where("email", "==", email));
    const qs = await getDocs(q);
    let profile = null;
    if (!qs.empty) profile = qs.docs[0].data();
    if (profile && qs.docs[0]) profile.uid = qs.docs[0].id;
    setFriendProgress({ ...friendProgress, [email]: { profile } });
  }

  return (
    <div className="card" style={{ width: "100%", maxWidth: 400, margin: "0 auto", marginTop: 24 }}>
      <h3>Arkadaş Ekle</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Kullanıcı adı veya email"
          value={friendInput}
          onChange={e => setFriendInput(e.target.value)}
        />
        <button onClick={sendFriendRequest}>İstek Gönder</button>
      </div>
      {error && <div style={{ color: "#f87171", marginTop: 6 }}>{error}</div>}
      <hr style={{ margin: "16px 0", borderColor: "#222" }} />
      <h4>Gelen İstekler</h4>
      <ul style={{ padding: 0, margin: 0 }}>
        {friendRequests.length === 0 && <li style={{ color: "#aaa" }}>İstek yok.</li>}
        {friendRequests.map(req => (
          <li key={req} style={{ marginBottom: 8 }}>
            <span>{requestNames[req] || "Kullanıcı"}</span>
            <button style={{ marginLeft: 8 }} onClick={() => acceptFriendRequest(req)}>Kabul Et</button>
          </li>
        ))}
      </ul>
      <h4>Bekleyen (Gönderilen) İstekler</h4>
      <ul style={{ padding: 0, margin: 0 }}>
        {pendingRequests.length === 0 && <li style={{ color: "#aaa" }}>Bekleyen istek yok.</li>}
        {pendingRequests.map(req => (
          <li key={req} style={{ marginBottom: 8 }}>
            <span>{pendingNames[req] || "Kullanıcı"}</span>
          </li>
        ))}
      </ul>
      <hr style={{ margin: "16px 0", borderColor: "#222" }} />
      <h4>Arkadaşlarım</h4>
      <ul style={{ padding: 0, margin: 0 }}>
        {friends.length === 0 && <li style={{ color: "#aaa" }}>Henüz arkadaşın yok.</li>}
        {friends.map(email => (
          <li key={email} style={{ marginBottom: 8 }}>
            <span>{friendNames[email] || "Kullanıcı"}</span>
            <button style={{ marginLeft: 8 }} onClick={async () => { await fetchFriendProgress(email); setShowProfile(email); }}>Profili Gör</button>
          </li>
        ))}
      </ul>
      {showProfile && friendProgress[showProfile]?.profile && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "#000a", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setShowProfile(null)}>
          <div style={{ background: "#18181b", borderRadius: 18, padding: 28, minWidth: 270, maxWidth: "90vw", boxShadow: "0 4px 24px #000a", color: "#fff", textAlign: "center", position: "relative" }} onClick={e => e.stopPropagation()}>
            <img src={friendProgress[showProfile].profile.photoURL} alt="Profil" style={{ width: 90, height: 90, borderRadius: "50%", marginBottom: 12, objectFit: "cover" }} />
            <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 6 }}>{friendProgress[showProfile].profile.displayName}</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>Boy: {friendProgress[showProfile].profile.boy || "-"} cm</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>Kilo: {friendProgress[showProfile].profile.kilo || "-"} kg</div>
            {/* Detaylı başarı, programlar ve günler */}
            <FriendProfileDetail profile={friendProgress[showProfile].profile} />
            <button onClick={() => setShowProfile(null)} style={{ position: "absolute", top: 8, right: 12, background: "#4ade80", color: "#18181b", border: 0, borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
