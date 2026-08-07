"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Navbar from "@/components/Navbar";
import LiveTopologyMap, { MeshNode } from "@/components/LiveTopologyMap";
import EvervaultTerminal, { MeshPacket } from "@/components/EvervaultTerminal";
import SosBanner, { SosAlertData } from "@/components/SosBanner";
import HeroLanding from "@/components/HeroLanding";
import { 
  Radio, 
  ShieldCheck, 
  Smartphone, 
  Terminal as TerminalIcon, 
  Layers, 
  Activity, 
  Cpu, 
  Lock, 
  AlertTriangle,
  ExternalLink,
  Send,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "landing" | "tech" | "security">("landing");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [packets, setPackets] = useState<MeshPacket[]>([]);
  const [sosAlert, setSosAlert] = useState<SosAlertData | null>(null);
  const [lastSender, setLastSender] = useState<string | undefined>(undefined);
  const [manualMessage, setManualMessage] = useState("");

  useEffect(() => {
    // Connect to deployed Render backend
const serverUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

console.log("[Dashboard] Connecting to Socket.io relay:", serverUrl);

const newSocket = io(serverUrl, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
});

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      // Register Gateway node
      newSocket.emit("REGISTER_NODE", {
        nodeId: "GATEWAY-01",
        deviceType: "Desktop Core Gateway",
        platform: "Next.js Command Center",
        batteryLevel: 100,
        rssi: 0,
        status: "Command Center Online"
      });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 1. Listen for updated mesh node telemetry roster
    newSocket.on("MESH_NODES_UPDATED", (updatedNodes: MeshNode[]) => {
      console.log("[Dashboard] Mesh nodes updated:", updatedNodes);
      setNodes(updatedNodes);
    });

    // 2. Listen for incoming mesh packet streams
    newSocket.on("RECEIVE_MESH_PACKET", (packet: MeshPacket) => {
      console.log("[Dashboard] Received mesh packet:", packet);
      setPackets((prev) => [packet, ...prev.slice(0, 49)]);
      setLastSender(packet.senderId);
      setTimeout(() => setLastSender(undefined), 3000);
    });

    // 3. Listen for SOS Alert Trigger
    newSocket.on("SOS_ALERT", (alert: SosAlertData) => {
      console.warn("[Dashboard] SOS ALERT RECEIVED:", alert);
      setSosAlert(alert);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendTestPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !isConnected || !manualMessage.trim()) return;

    socket.emit("SEND_MESH_PACKET", {
      senderId: "GATEWAY-01",
      plainTextPreview: manualMessage,
      encryptedPayload: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      hops: 1,
      ttl: 16
    });

    setManualMessage("");
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Emergency SOS Banner Notification */}
      <SosBanner alert={sosAlert} onDismiss={() => setSosAlert(null)} />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeNodesCount={nodes.length}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {activeTab === "landing" && (
          <HeroLanding onOpenLiveDemo={() => setActiveTab("dashboard")} />
        )}

        {activeTab === "dashboard" && (
          <div className="max-w-container-max mx-auto px-6 pt-8 space-y-8 animate-fadeIn">
            {/* Command Center Status Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    Live Hackathon Pitch Mode: Mesh Relay Command Center
                    <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      ACTIVE SOCKET RELAY
                    </span>
                  </h1>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Connect your physical mobile phone to transmit live encrypted payloads directly onto this desktop dashboard.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <a
                  href="/mobile"
                  target="_blank"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all w-full md:w-auto"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Launch Phone Client (/mobile)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Packet Broadcast Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <form onSubmit={handleSendTestPacket} className="flex-1 flex gap-3">
                <input
                  type="text"
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder="Inject mock mesh payload from Desktop Gateway..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-blue-600 transition-all"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !manualMessage.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Packet</span>
                </button>
              </form>
            </div>

            {/* Grid Layout: Left Topology Map, Right Evervault Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6">
                <LiveTopologyMap
                  nodes={nodes}
                  activePacketCount={packets.length}
                  lastPacketSender={lastSender}
                />
              </div>

              <div className="lg:col-span-6">
                <EvervaultTerminal packets={packets} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "tech" && (
          <div className="max-w-container-max mx-auto px-6 pt-12 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold text-slate-900">Decentralized Mesh Architecture</h1>
              <p className="text-slate-600 text-base">
                Technical specification of the GhostMesh peer-to-peer transport protocol, onion routing layers, and resilient store-and-forward mechanisms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Radio Abstraction Layer</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  GhostMesh decouples transport protocols into modular radio drivers (BLE, Wi-Fi Direct, Multicast UDP, LoRa 915MHz). Payloads are broken into 256-byte MTU blocks and distributed across available radio spectrum.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Double Ratchet Protocol</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Provides cryptographic resilience with Diffie-Hellman ratcheting for every single message packet. Even if a physical device is seized during field operation, historical packet transcripts remain completely uncrackable.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-container-max mx-auto px-6 pt-12 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold text-slate-900">Cryptographic Security Inspection</h1>
              <p className="text-slate-600 text-base">
                Zero-trust protocol verification with real-time Evervault packet stream analysis.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <EvervaultTerminal packets={packets} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-container-max mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-900">
            <Radio className="w-5 h-5 text-blue-600" />
            <span>GhostMesh Core</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            © 2026 GhostMesh Protocol. Real-time WebSocket Mesh Relay for Hackathon Demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
}
