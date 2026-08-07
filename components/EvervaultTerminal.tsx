"use client";

import React, { useState } from "react";
import { Terminal, Shield, Lock, Cpu, Copy, Check, ArrowRight, Activity, Filter } from "lucide-react";

export interface MeshPacket {
  packetId: string;
  senderId: string;
  encryptedPayload: string;
  plainTextPreview: string;
  timestamp: string;
  hops: number;
  ttl: number;
  route: string[];
  signalStrength?: string;
}

interface EvervaultTerminalProps {
  packets: MeshPacket[];
}

export default function EvervaultTerminal({ packets }: EvervaultTerminalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "encrypted" | "routes">("all");

  const handleCopy = (hex: string, id: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl font-mono relative overflow-hidden backdrop-blur-2xl">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2 font-sans">
              Evervault Security Inspector
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                AES-256-GCM + Double Ratchet
              </span>
            </h3>
            <p className="text-xs text-slate-400">Real-Time Hex Packet Stream & Cryptographic Inspection</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <button
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
              filterType === "all" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            All Stream ({packets.length})
          </button>
          <button
            onClick={() => setFilterType("encrypted")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
              filterType === "encrypted" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            Encrypted Hex
          </button>
        </div>
      </div>

      {/* Terminal Stream Feed */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 h-[380px] overflow-y-auto terminal-scroll space-y-3 font-mono">
        {packets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-10">
            <Lock className="w-10 h-10 mb-3 text-slate-700 animate-pulse" />
            <p className="text-xs text-slate-400 font-sans font-semibold">Listening for Live Encrypted Mesh Packets...</p>
            <p className="text-[11px] text-slate-600 max-w-sm mt-1">
              Transmit a message from your physical phone node to inspect live AES packet relay metadata here.
            </p>
          </div>
        ) : (
          packets.map((pkt) => (
            <div
              key={pkt.packetId}
              className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-all space-y-2 group"
            >
              {/* Packet Meta Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{pkt.packetId}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">{pkt.senderId}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{pkt.timestamp}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-800">
                    Hops: {pkt.hops}
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 border border-slate-800">
                    TTL: {pkt.ttl}
                  </span>
                  <button
                    onClick={() => handleCopy(pkt.encryptedPayload, pkt.packetId)}
                    className="text-slate-500 hover:text-slate-200 transition-colors p-1"
                    title="Copy Payload Hex"
                  >
                    {copiedId === pkt.packetId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Raw Encrypted Hex String */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400/90 break-all select-all flex items-center justify-between">
                <span>{pkt.encryptedPayload}</span>
                <span className="text-[10px] text-slate-500 ml-2 font-sans font-medium whitespace-nowrap">AES-256</span>
              </div>

              {/* Plaintext & Onion Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                  <span className="text-slate-500 text-[10px] block mb-0.5">DECRYPTED PAYLOAD PREVIEW:</span>
                  <p className="text-slate-200 font-sans text-xs">{pkt.plainTextPreview}</p>
                </div>

                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                  <span className="text-slate-500 text-[10px] block mb-0.5">SIMULATED ONION ROUTE TRACE:</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] overflow-x-auto whitespace-nowrap">
                    {pkt.route.map((r, idx) => (
                      <React.Fragment key={idx}>
                        <span className={idx === pkt.route.length - 1 ? "text-cyan-400 font-bold" : "text-slate-400"}>
                          {r}
                        </span>
                        {idx < pkt.route.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
