"use client";

import React, { useState } from "react";
import { Radio, Lock, Wifi, Battery, Send, ShieldCheck, CheckCheck } from "lucide-react";

export default function PhoneMockup() {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <div className="relative w-full max-w-[380px] group">
        <div className="absolute inset-0 bg-blue-500/20 rounded-[3rem] blur-3xl -z-10 transform translate-y-6 group-hover:scale-105 transition-transform duration-500" />
        <img
          alt="GhostMesh 3D Smartphone Interface Mockup"
          className="w-full h-auto drop-shadow-2xl rounded-3xl border border-slate-200/50 shadow-2xl transition-transform duration-300"
          src="/mockup.png"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Pure React CSS/SVG Interactive Smartphone Mockup Fallback
  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      <div className="absolute inset-0 bg-blue-600/15 rounded-[3.5rem] blur-3xl -z-10" />

      {/* Phone Body Frame */}
      <div className="bg-slate-900 p-3 rounded-[3rem] shadow-2xl border-4 border-slate-800 relative">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <div className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />
        </div>

        {/* Screen Container */}
        <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 pt-9 pb-4 px-3.5 space-y-3 font-sans text-slate-900">
          {/* Header */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-none text-slate-900">GhostMesh Node</h4>
                <p className="text-[9px] font-mono text-slate-500 mt-0.5">NODE-8F9A2B • Encrypted</p>
              </div>
            </div>

            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              MESH ACTIVE
            </span>
          </div>

          {/* Chat Bubble Stream */}
          <div className="space-y-2 py-1 font-sans text-[11px]">
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-mono text-slate-400 mb-0.5 px-1">Sarah (Node-401) • 10:48 AM</span>
              <div className="bg-white p-2.5 rounded-2xl rounded-bl-none border border-slate-200 text-slate-800 max-w-[85%] shadow-sm">
                <p className="leading-snug">Can you verify the offline mesh specs? [Encrypted]</p>
                <span className="text-[8px] font-mono text-slate-400 block mt-1">AES-256-GCM Payload</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-slate-400 mb-0.5 px-1">You • 10:50 AM</span>
              <div className="bg-blue-600 text-white p-2.5 rounded-2xl rounded-br-none max-w-[85%] shadow-sm">
                <p className="leading-snug">Received! Packet routed through 3 local radios without internet. [Encrypted]</p>
                <div className="flex items-center justify-end gap-1 text-[8px] text-blue-200 font-mono mt-1">
                  <span>0xce1f96a3...</span>
                  <CheckCheck className="w-3 h-3 text-blue-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Input Box */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value="Secure Offline Payload..."
              className="flex-1 bg-transparent text-[10px] font-mono text-slate-400 px-2 outline-none"
            />
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Send className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
