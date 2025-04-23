"use client";
import Navbar from "../../components/Navbar";
import FriendList from "./FriendList";
import React from "react";

export default function ArkadaslarPage() {
  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Arkadaşlar</h2>
        <FriendList />
      </div>
    </>
  );
}
