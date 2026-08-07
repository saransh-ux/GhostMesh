"use client";

import React, { useState } from "react";
import { Smartphone, Monitor, Radio, Battery, Wifi, ShieldCheck, Zap, Activity } from "lucide-react";

export interface MeshNode {
  nodeId: string;
  socketId?: string;
  deviceType: string;
  platform?: string;
  batteryLevel: number;
  rssi: number;
  status: string;
  connectedAt?: string;
}

interface LiveTopologyMapProps {
  nodes: MeshNode[];
  activePacketCount: number;
  lastPacketSender?: string;
}

export default function LiveTopologyMap({ nodes, activePacketCount, lastPacketSender }: LiveTopologyMapProps) {
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);

  // Position nodes radially around the central gateway
  const center = { x: 320, y: 220 };
  const radius = 150;

  const nodePositions = nodes.map((node, i) => {
    const angle = (i * 2 * Math.PI) / Math.max(nodes.length, 1) - Math.PI / 2;
    return {
      node,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      angle
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Topology Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Mesh Topology Visualizer
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {nodes.length} Physical Node{nodes.length !== 1 ? "s" : ""} Connected
              </span>
            </h2>
            <p className="text-xs font-mono text-slate-400">Real-Time Peer-to-Peer Signal Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Relayed Packets: <strong className="text-white">{activePacketCount}</strong></span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-[420px] bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#64748b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* SVG Signal Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Concentric Signal Rings */}
          <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx={center.x} cy={center.y} r={radius * 0.5} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

          {/* Lines to Nodes */}
          {nodePositions.map(({ node, x, y }, idx) => {
            const isBroadcasting = lastPacketSender === node.nodeId;
            return (
              <g key={node.nodeId || idx}>
                <line
                  x1={center.x}
                  y1={center.y}
                  x2={x}
                  y2={y}
                  stroke={isBroadcasting ? "#38bdf8" : "#334155"}
                  strokeWidth={isBroadcasting ? "2.5" : "1.5"}
                  strokeDasharray={isBroadcasting ? "none" : "4 4"}
                  className="transition-all duration-300"
                />
                {isBroadcasting && (
                  <circle cx={(center.x + x) / 2} cy={(center.y + y) / 2} r="4" fill="#38bdf8" className="animate-ping" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central Gateway Node */}
        <div
          style={{ left: `${center.x - 45}px`, top: `${center.y - 45}px` }}
          className="absolute w-24 h-24 rounded-full bg-blue-950/80 border-2 border-blue-500 shadow-2xl shadow-blue-500/30 flex flex-col items-center justify-center text-center z-20 backdrop-blur-md cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mb-1">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-mono font-bold text-white leading-none">GATEWAY-01</span>
          <span className="text-[9px] font-mono text-blue-300 mt-0.5">Desktop Core</span>
        </div>

        {/* Mobile Nodes Spawning Dynamically */}
        {nodePositions.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 z-10">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 animate-pulse">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">Waiting for Physical Mobile Node...</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 font-mono">
              Open <code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded">/mobile</code> on your phone or open another browser tab to automatically register a live mesh node.
            </p>
          </div>
        ) : (
          nodePositions.map(({ node, x, y }) => {
            const isSelected = selectedNode?.nodeId === node.nodeId;
            const isBroadcasting = lastPacketSender === node.nodeId;

            return (
              <div
                key={node.nodeId}
                onClick={() => setSelectedNode(node)}
                style={{ left: `${x - 36}px`, top: `${y - 36}px` }}
                className={`absolute w-18 h-18 p-2 rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-30 hover:scale-110 shadow-lg ${
                  isBroadcasting
                    ? "bg-cyan-950/90 border-cyan-400 shadow-cyan-500/40 ring-4 ring-cyan-500/20"
                    : isSelected
                    ? "bg-blue-950/90 border-blue-400 shadow-blue-500/40"
                    : "bg-slate-900/90 border-slate-700 hover:border-slate-500"
                }`}
              >
                <div className="relative mb-1">
                  <Smartphone className={`w-5 h-5 ${isBroadcasting ? "text-cyan-400 animate-bounce" : "text-slate-200"}`} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-200 truncate max-w-[70px]">
                  {node.nodeId}
                </span>
                <span className="text-[9px] font-mono text-cyan-400 font-semibold">
                  {node.rssi}dBm
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Roster of Connected Nodes */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <div
            key={node.nodeId}
            onClick={() => setSelectedNode(node)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-white">{node.nodeId}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{node.deviceType}</p>
              </div>
            </div>

            <div className="text-right font-mono text-[11px]">
              <div className="flex items-center justify-end gap-1 text-emerald-400 font-semibold">
                <Battery className="w-3.5 h-3.5" />
                <span>{node.batteryLevel}%</span>
              </div>
              <span className="text-cyan-400 text-[10px]">{node.rssi} dBm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
