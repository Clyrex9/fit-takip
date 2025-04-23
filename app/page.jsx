"use client";
import React from "react";
import Navbar from "../components/Navbar";
import DashboardSummary from "./DashboardSummary";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container">
        <DashboardSummary />
      </div>
    </>
  );
}
