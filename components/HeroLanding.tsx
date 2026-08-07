"use client";

import React from "react";
import Link from "next/link";
import PhoneMockup from "@/components/PhoneMockup";
import { Radio, Lock, WifiOff, Route, BatteryCharging, EyeOff, Smartphone, Watch, Router, ArrowRight } from "lucide-react";

interface HeroLandingProps {
  onOpenLiveDemo: () => void;
}

export default function HeroLanding({ onOpenLiveDemo }: HeroLandingProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-container-max mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-mono text-xs font-semibold text-slate-700">v2.0 Network Core Live • Hackathon Ready</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight font-sans">
              Communication survives.<br />
              <span className="text-slate-400">Even when the internet doesn't.</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              Decentralized, end-to-end encrypted mesh networking for critical communications. Zero cellular infrastructure required. Connect physical devices live during emergencies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onOpenLiveDemo}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
              >
                <span>Launch Live Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="/mobile"
                target="_blank"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Open Mobile Node Controller</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative z-10 flex justify-center lg:justify-end mt-12 lg:mt-0">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-slate-200 bg-slate-50">
        <div className="max-w-container-max mx-auto px-6 text-center">
          <p className="font-mono text-xs text-slate-500 mb-6 uppercase tracking-widest font-semibold">
            Trusted by resilient defense & infrastructure teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale font-bold text-lg text-slate-800">
            <span>AcmeCorp</span>
            <span>GlobalLogistics</span>
            <span>SecurNet</span>
            <span>AeroSpaceX</span>
          </div>
        </div>
      </section>

      {/* Three Core Columns */}
      <section className="py-24 max-w-container-max mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for extreme resilience.</h2>
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
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-container-max mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Advanced Protocol Capabilities.</h2>
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
