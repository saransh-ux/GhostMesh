"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PhoneMockup from "@/components/PhoneMockup";
import { Radio, Lock, WifiOff, Route, BatteryCharging, EyeOff, Smartphone, Watch, Router, ArrowRight, ShieldCheck, Activity, Zap } from "lucide-react";

interface HeroLandingProps {
  onOpenLiveDemo: () => void;
}

export default function HeroLanding({ onOpenLiveDemo }: HeroLandingProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerMessages = [
    "PAYLOAD RELAYED: NODE-944621 ➔ GATEWAY-01 [AES-256-GCM Verified]",
    "BLE PEER DISCOVERED: NODE-243148 (-62 dBm Signal Strength)",
    "STORE & FORWARD QUEUE: 0 Pending • 100% Mesh Health",
    "ZK AUTHENTICATION: Ed25519 Cryptographic Handshake OK",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-mono text-xs font-bold text-blue-800">GhostMesh v2.0 Protocol Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Decentralized Mesh Comms.<br />
              <span className="text-blue-600">Off-Grid Peer-to-Peer Network.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              GhostMesh establishes resilient, peer-to-peer encrypted mesh networks across mobile devices via Bluetooth LE, local radios, and Zero-Knowledge identity — keeping critical comms alive during blackouts and off-grid operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onOpenLiveDemo}
                className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
              >
                <span>Launch Live Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="/mobile"
                target="_blank"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-7 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Open Mobile Node Controller</span>
              </a>
            </div>

            {/* Movable Animated Live Stream Ticker */}
            <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-2xl flex items-center gap-3 shadow-lg max-w-xl">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Activity className="w-4 h-4 animate-spin" />
              </div>
              <div className="overflow-hidden flex-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block tracking-wider">
                  Live Mesh Telemetry Stream
                </span>
                <p className="text-xs font-mono text-slate-200 truncate transition-all duration-500">
                  {tickerMessages[tickerIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* Pure Code Cybernetic Mesh Visualizer (Replaces Phone Mockup Image Entirely) */}
          <div className="lg:col-span-6 relative z-10 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Background Glow */}
              <div className="absolute -inset-4 rounded-3xl bg-blue-600/15 blur-3xl animate-pulse -z-10" />

              {/* Dynamic Cybernetic Mesh Visualizer Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-5">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        GhostMesh Signal Matrix
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400">P2P Peer Discovery Engine</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30 font-bold">
                    3 ACTIVE NODES
                  </span>
                </div>

                {/* Animated Radial Radar Visualizer */}
                <div className="relative h-60 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="radar-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#64748b" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#radar-grid)" />
                  </svg>

                  {/* Concentric Rings */}
                  <div className="absolute w-48 h-48 rounded-full border border-slate-800 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="absolute w-32 h-32 rounded-full border border-blue-500/20 border-dashed animate-[spin_12s_linear_infinite_reverse]" />

                  {/* Central Gateway */}
                  <div className="relative z-20 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/50 mb-1">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white">GATEWAY-01</span>
                  </div>

                  {/* Satellite Node 1 - Top Right */}
                  <div className="absolute top-6 right-10 flex flex-col items-center animate-bounce [animation-duration:3s]">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/30">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-cyan-300 font-bold mt-0.5">NODE-944621</span>
                  </div>

                  {/* Satellite Node 2 - Bottom Left */}
                  <div className="absolute bottom-6 left-10 flex flex-col items-center animate-bounce [animation-duration:4s]">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-emerald-300 font-bold mt-0.5">NODE-243148</span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Encryption: <strong className="text-white">AES-256-GCM</strong></span>
                  </div>
                  <span className="text-emerald-400 font-bold">100% HEALTHY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Core Columns */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Built for extreme resilience.</h2>
          <p className="text-slate-600 text-base">
            When cellular towers go down, GhostMesh dynamically routes encrypted packets device-to-device across local radios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Infrastructure</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Operates entirely without cellular towers, internet routers, or satellite uplinks by connecting peer-to-peer over Bluetooth & Wi-Fi Direct.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Double Ratchet Crypto</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every message packet is encrypted end-to-end using Signal-standard double ratchet algorithms, offering forward & post-compromise secrecy.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Self-Healing Network</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The mesh automatically reroutes packets around nodes that drop offline or move out of range, ensuring 100% packet delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Advanced Protocol Capabilities.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px]">
            <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="max-w-md z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Store & Forward Protocol</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Intermediary mobile nodes store encrypted payload blocks until target devices enter proximity range, bridging fragmented mesh segments.
                </p>
              </div>
              <div className="flex justify-end">
                <Route className="w-24 h-24 text-slate-200 group-hover:text-blue-500/20 transition-colors" />
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Low Energy BLE</h3>
                <p className="text-slate-600 text-sm">Optimized background listening drains less than 1.5% battery per 24 hours.</p>
              </div>
              <div className="flex justify-end text-blue-600">
                <BatteryCharging className="w-10 h-10" />
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Onion-Routed Traffic</h3>
                <p className="text-slate-600 text-sm">Multi-layer encryption prevents metadata analysis by intermediate mesh relays.</p>
              </div>
              <div className="flex justify-end text-blue-600">
                <EyeOff className="w-10 h-10" />
              </div>
            </div>

            <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-8 flex items-center justify-between hover:shadow-xl transition-all">
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Cross-Platform Relay</h3>
                <p className="text-slate-600 text-sm">Bridges iOS, Android, Linux desktop nodes, and embedded LoRa gateways into one unified web.</p>
              </div>
              <div className="flex gap-4 text-slate-400 pr-4">
                <Smartphone className="w-10 h-10" />
                <Watch className="w-10 h-10" />
                <Router className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

