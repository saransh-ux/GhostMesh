"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import LiveTopologyMap, { MeshNode } from "@/components/LiveTopologyMap";
import EvervaultTerminal, { MeshPacket } from "@/components/EvervaultTerminal";
import SosBanner, { SosAlertData } from "@/components/SosBanner";
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  Activity, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  Check, 
  Power, 
  Radio, 
  RefreshCw, 
  ExternalLink,
  X,
  Zap,
  Cpu,
  Info
} from "lucide-react";

export default function DashboardPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [packets, setPackets] = useState<MeshPacket[]>([]);
  const [sosAlert, setSosAlert] = useState<SosAlertData | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [localIpUrl, setLocalIpUrl] = useState("http://172.22.210.170:3000/mobile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const port = window.location.port || "3000";
      // Use exact LAN IP if on localhost/127.0.0.1, or dynamic origin
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        setLocalIpUrl("http://172.22.210.170:3000/mobile");
      } else {
        setLocalIpUrl(`http://${hostname}:${port}/mobile`);
      }
    }

    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : "http://localhost:3001");

    console.log("[Multi-Device Telemetry Dashboard] Connecting:", serverUrl);
    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("REGISTER_NODE", {
        nodeId: "GATEWAY-01",
        deviceType: "Desktop Telemetry Dashboard",
        platform: "Next.js Core",
        batteryLevel: 100,
        rssi: 0,
        status: "Telemetry Gateway Online"
      });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("MESH_NODES_UPDATED", (updatedNodes: MeshNode[]) => {
      setNodes(updatedNodes);
    });

    newSocket.on("RECEIVE_MESH_PACKET", (packet: MeshPacket) => {
      setPackets((prev) => [packet, ...prev.slice(0, 49)]);
    });

    newSocket.on("SOS_ALERT", (alert: SosAlertData) => {
      setSosAlert(alert);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(localIpUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* SOS Banner */}
      <SosBanner alert={sosAlert} onDismiss={() => setSosAlert(null)} />

      {/* Top Navbar */}
      <Navbar
        activeTab="dashboard"
        setActiveTab={() => {}}
        activeNodesCount={nodes.length}
        isConnected={isConnected}
      />

      {/* Offline QR Code Connection Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-sans">
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>Scan to Connect Mobile Node</span>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
              {/* Dynamic QR Code Container */}
              <div className="w-52 h-52 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
                <QRCodeSVG
                  value={localIpUrl}
                  size={184}
                  level="H"
                  includeMargin={true}
                  fgColor="#0F172A"
                  bgColor="#FFFFFF"
                />
              </div>

              {/* Instructions for Judges & Reviewers */}
              <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl flex items-start gap-2.5 text-left text-xs text-blue-950 font-sans">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Judge Instructions:</strong> Point any smartphone camera at this screen to instantly pair the device to the local off-grid mesh network.
                </p>
              </div>

              {/* URL Display with 1-Click Copy Button */}
              <div className="w-full bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between font-mono text-xs text-slate-800 shadow-sm">
                <span className="truncate mr-2 font-bold text-blue-600">{localIpUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold text-[11px] flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full bg-slate-900 text-white font-semibold text-xs py-3 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-container-max mx-auto px-6 py-8 space-y-8 w-full">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Multi-Device Telemetry Command Center
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                  {nodes.length} ACTIVE NODE{nodes.length !== 1 ? "S" : ""}
                </span>
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Real-time telemetry, adaptive power management, and peer-to-peer signal inspection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setQrModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan to Connect Mobile Node</span>
            </button>

            <Link
              href="/auth"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>ZK Identity System</span>
            </Link>
          </div>
        </div>

        {/* Multi-Device Telemetry Metrics Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Connected Node Telemetry Matrix
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nodes.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-3">
                <Smartphone className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
                <p className="text-xs font-mono font-semibold">No Phone Nodes Currently Connected</p>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Click here to open QR Code Connection Modal</span>
                </button>
              </div>
            ) : (
              nodes.map((node) => {
                const isLowBattery = node.batteryLevel < 20;
                return (
                  <div
                    key={node.nodeId}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <h3 className="font-mono font-bold text-xs text-slate-900">{node.nodeId}</h3>
                        <p className="text-[10px] font-mono text-slate-500">{node.deviceType}</p>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isLowBattery
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isLowBattery ? "ECO SAVE" : "PERFORMANCE"}
                      </span>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Battery</span>
                        <div className="flex items-center gap-1">
                          <Battery className={`w-3.5 h-3.5 ${isLowBattery ? "text-rose-600" : "text-emerald-600"}`} />
                          <span className={`font-bold ${isLowBattery ? "text-rose-600" : "text-slate-800"}`}>
                            {node.batteryLevel}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Signal RSSI</span>
                        <div className="flex items-center gap-1">
                          <Wifi className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-bold text-slate-800">{node.rssi} dBm</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1">
                      <span>Status: <strong className="text-slate-700">{node.status}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Live Topology Map & Evervault Terminal Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <LiveTopologyMap nodes={nodes} activePacketCount={packets.length} />
          </div>

          <div className="lg:col-span-6">
            <EvervaultTerminal packets={packets} />
          </div>
        </section>
      </main>
    </div>
  );
}
