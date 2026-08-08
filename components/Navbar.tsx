"use client";

import React from "react";
import Link from "next/link";
import { Radio, Smartphone, Activity, Shield, Cpu, Layers, Key, QrCode } from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "landing" | "tech" | "security";
  setActiveTab: (tab: "dashboard" | "landing" | "tech" | "security") => void;
  activeNodesCount: number;
  isConnected: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  activeNodesCount,
  isConnected,
}: NavbarProps) {
  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 w-full z-40 border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 h-20 gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform text-white">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">GhostMesh</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                v2.0 CORE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Decentralized Mesh Protocol</p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "landing"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Landing
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Command Center
            {activeNodesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-emerald-400 text-slate-950 font-bold rounded-full animate-pulse">
                {activeNodesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tech")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "tech"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Technology
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Security & Crypto
          </button>
        </div>

        {/* Right Action Links */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/auth"
            className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200"
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>ZK Auth</span>
          </Link>

          <a
            href="/mobile"
            target="_blank"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open Phone Node</span>
          </a>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`} />
            <span className="text-[10px] font-mono font-bold text-slate-700">
              {isConnected ? "RELAY LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
