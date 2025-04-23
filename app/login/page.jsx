"use client";
import React from "react";
import { auth, provider, signInWithPopup } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Kullanıcı bilgileri
      const user = result.user;
      alert("Giriş başarılı: " + user.displayName);
      router.replace("/"); // Başarılı girişte ana sayfaya yönlendir
    } catch (error) {
      alert("Giriş başarısız: " + error.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 100 }}>
      <h1>Google ile Giriş Yap</h1>
      <button onClick={handleGoogleSignIn} style={{ padding: 12, fontSize: 16, marginTop: 20, cursor: "pointer" }}>
        Google ile Giriş Yap
      </button>
    </div>
  );
}
