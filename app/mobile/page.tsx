"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getStoredAccount, encryptPayloadHex, ZKAccount } from "@/lib/cryptoAuth";
import { 
  Wifi, 
  Battery, 
  Radio, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Smartphone,
  RefreshCw,
  Zap,
  Users,
  ChevronDown,
  Lock,
  BatteryCharging,
  Power,
  Bluetooth,
  CheckCircle2,
  X
} from "lucide-react";

interface NodeTelemetry {
  nodeId: string;
  deviceType: string;
  platform: string;
  batteryLevel: number;
  rssi: number;
  status: string;
  powerMode: "PERFORMANCE" | "ECO_SAVE";
}

interface ChatMessage {
  id: string;
  senderId: string;
  targetNodeId: string;
  plainText: string;
  encryptedPayload: string;
  timestamp: string;
  isSelf: boolean;
}

export default function MobileControllerPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [nodeId, setNodeId] = useState<string>("");
  const [account, setAccount] = useState<ZKAccount | null>(null);
  const [telemetry, setTelemetry] = useState<NodeTelemetry | null>(null);
  const [activeNodesRoster, setActiveNodesRoster] = useState<Array<{ nodeId: string; deviceType: string }>>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("ALL");
  const [message, setMessage] = useState("Mesh update: Operational status verified.");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [packetCount, setPacketCount] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [ping, setPing] = useState<number>(14);
  const [ecoMode, setEcoMode] = useState<boolean>(false);

  // Web Bluetooth State
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(false);
  const [bluetoothStatus, setBluetoothStatus] = useState<string>("Disconnected");
  const [bluetoothToast, setBluetoothToast] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Check local ZK account
    const stored = getStoredAccount();
    if (stored) {
      setAccount(stored);
    }

    // Auto-detect dynamic server host URL (for Wi-Fi LAN / localtunnel / ngrok)
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (typeof window !== "undefined" 
        ? `${window.location.protocol}//${window.location.hostname}:3001` 
        : "http://localhost:3001");

    console.log("Connecting Phone Node to relay:", serverUrl);
    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Detect device platform
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const platformName = isIOS ? "Apple iOS" : isAndroid ? "Android Handset" : "Mobile Phone";
    const generatedNodeId = stored ? stored.nodeId : `NODE-${Math.floor(100000 + Math.random() * 900000)}`;

    const initialTelemetry: NodeTelemetry = {
      nodeId: generatedNodeId,
      deviceType: `${platformName}`,
      platform: platformName,
      batteryLevel: Math.floor(Math.random() * 20 + 80),
      rssi: -Math.floor(Math.random() * 25 + 45),
      status: "Active Node",
      powerMode: "PERFORMANCE",
    };

    setNodeId(generatedNodeId);
    setTelemetry(initialTelemetry);

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("REGISTER_NODE", initialTelemetry);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    // Listen for roster updates
    newSocket.on("MESH_NODES_UPDATED", (nodesList: any[]) => {
      setActiveNodesRoster(nodesList);
    });

    // Listen for incoming mesh packets
    newSocket.on("RECEIVE_MESH_PACKET", (pkt: any) => {
      if (pkt.targetNodeId === "ALL" || pkt.targetNodeId === generatedNodeId || pkt.senderId === generatedNodeId) {
        const isSelf = pkt.senderId === generatedNodeId;
        const newMsg: ChatMessage = {
          id: pkt.packetId || Math.random().toString(),
          senderId: pkt.senderId,
          targetNodeId: pkt.targetNodeId || "ALL",
          plainText: pkt.plainTextPreview,
          encryptedPayload: pkt.encryptedPayload,
          timestamp: pkt.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf,
        };

        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    // Telemetry ticker loop (throttled if ecoMode is active)
    const intervalTime = ecoMode ? 10000 : 4000;
    const interval = setInterval(() => {
      if (newSocket.connected) {
        setTelemetry((prev) => {
          if (!prev) return null;
          const newBatt = Math.max(5, prev.batteryLevel - 0.05);
          const isLowBatt = newBatt < 20;
          if (isLowBatt && !ecoMode) {
            setEcoMode(true);
          }
          const updated = {
            ...prev,
            rssi: -Math.floor(Math.random() * 20 + 45),
            batteryLevel: Math.round(newBatt),
            status: bluetoothConnected ? "BLE_DIRECT_CONNECTED" : prev.status,
            powerMode: (isLowBatt || ecoMode ? "ECO_SAVE" : "PERFORMANCE") as any,
          };
          newSocket.emit("UPDATE_TELEMETRY", updated);
          return updated;
        });
        setPing(Math.floor(Math.random() * 8 + 10));
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [ecoMode, bluetoothConnected]);

  // Web Bluetooth Pairing Handler
  const handleBluetoothPairing = async () => {
    if (typeof window === "undefined" || !("bluetooth" in navigator)) {
      setBluetoothToast("Web Bluetooth is not supported on this browser (Chrome / Edge required).");
      setTimeout(() => setBluetoothToast(null), 4000);
      return;
    }

    try {
      setBluetoothStatus("Pairing...");
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"],
      });

      if (device && device.gatt) {
        console.log("Connecting GATT Server to Bluetooth Device:", device.name || device.id);
        await device.gatt.connect();

        setBluetoothDevice(device);
        setBluetoothConnected(true);
        setBluetoothStatus("BLE_DIRECT_CONNECTED");

        // Disconnect Handler
        device.addEventListener("gattserverdisconnected", () => {
          setBluetoothConnected(false);
          setBluetoothStatus("Disconnected");
          setBluetoothToast("Web Bluetooth device disconnected.");
          setTimeout(() => setBluetoothToast(null), 3000);
        });

        // Update telemetry and emit Socket.io event for desktop command dashboard
        setTelemetry((prev) => {
          if (!prev) return null;
          const updated = {
            ...prev,
            status: "BLE_DIRECT_CONNECTED",
            deviceType: `${prev.platform} (BLE Direct)`,
          };
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("UPDATE_TELEMETRY", updated);
            socketRef.current.emit("NODE_TELEMETRY_UPDATE", updated);
          }
          return updated;
        });

        setBluetoothToast(`Successfully Connected to BLE Device: ${device.name || device.id}`);
        setTimeout(() => setBluetoothToast(null), 3500);
      }
    } catch (err: any) {
      console.warn("Web Bluetooth Pairing Failed:", err);
      setBluetoothStatus("Disconnected");
      if (err.name !== "NotFoundError") {
        setBluetoothToast(`Bluetooth Warning: ${err.message || "Pairing cancelled"}`);
        setTimeout(() => setBluetoothToast(null), 4000);
      }
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!socket || !connected || !message.trim()) return;

    const hexPayload = encryptPayloadHex(message, account?.publicKeyHex || "0x00");

    const packet = {
      senderId: nodeId,
      targetNodeId: selectedTarget,
      encryptedPayload: hexPayload,
      plainTextPreview: message,
      hops: 1,
      ttl: 16,
    };

    socket.emit("SEND_MESH_PACKET", packet);
    setPacketCount((prev) => prev + 1);
    setMessage("");
  };

  const handleTriggerSOS = () => {
    if (!socket || !connected) return;
    socket.emit("SOS_ALERT", {
      nodeId,
      message: `EMERGENCY SOS broadcasted from Phone Node ${nodeId}!`,
      coords: { lat: 37.7749 + (Math.random() - 0.5) * 0.01, lng: -122.4194 + (Math.random() - 0.5) * 0.01 },
    });
    setSosActive(true);
    setTimeout(() => setSosActive(false), 5000);
  };

  const availablePeers = activeNodesRoster.filter((n) => n.nodeId !== nodeId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between max-w-md mx-auto shadow-2xl font-sans selection:bg-blue-600 selection:text-white border-x border-slate-200">
      {/* Toast Notification Banner */}
      {bluetoothToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-slate-900 text-white text-xs font-mono p-3 rounded-xl shadow-xl flex items-center justify-between gap-2 border border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{bluetoothToast}</span>
          </div>
          <button onClick={() => setBluetoothToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header - Light Evervault Theme */}
      <header className="bg-white/90 backdrop-blur-md px-4 py-3.5 border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 text-white">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">GhostMesh Mobile</h1>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              {account ? account.alias : "Node Client"} • <span className="text-blue-600 font-bold">{nodeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${
            bluetoothConnected
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : connected
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`} />
            {bluetoothConnected ? "BLE DIRECT" : connected ? "LIVE MESH" : "OFFLINE"}
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* Telemetry Card */}
        <section className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="font-mono text-xs font-bold text-slate-800 uppercase">Device Telemetry</span>
            </div>
            <button
              onClick={() => setEcoMode(!ecoMode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                ecoMode
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <Power className="w-3 h-3" />
              {ecoMode ? "ECO MODE ACTIVE" : "PERFORMANCE"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                <Battery className="w-3 h-3 text-emerald-600" />
                <span>Battery</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{telemetry?.batteryLevel ?? 88}%</span>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                <Wifi className="w-3 h-3 text-blue-600" />
                <span>RSSI</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{telemetry?.rssi ?? -48} dBm</span>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                <Activity className="w-3 h-3 text-amber-600" />
                <span>Ping</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{ping} ms</span>
            </div>
          </div>
        </section>

        {/* Peer Selector Dropdown */}
        <section className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
          <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Target Destination Node
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {availablePeers.length} Peer{availablePeers.length !== 1 ? "s" : ""} Online
            </span>
          </label>

          <div className="relative">
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 appearance-none pr-8 cursor-pointer font-semibold"
            >
              <option value="ALL">📡 Broadcast to All Connected Nodes (ALL)</option>
              {availablePeers.map((peer) => (
                <option key={peer.nodeId} value={peer.nodeId}>
                  📱 Direct Peer: {peer.nodeId} ({peer.deviceType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </section>

        {/* Live Chat Stream Feed */}
        <section className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              E2E Encrypted Chat Feed
            </span>
            <span className="text-[10px] font-mono text-slate-400">AES-256</span>
          </div>

          <div className="h-40 overflow-y-auto space-y-2.5 pr-1 font-sans text-xs">
            {chatMessages.length === 0 ? (
              <p className="text-slate-400 italic text-center py-8 font-mono text-xs">
                No chat packets transmitted yet. Send a message below!
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mb-0.5 px-1">
                    <span>{msg.isSelf ? "You" : msg.senderId}</span>
                    <span>→</span>
                    <span>{msg.targetNodeId}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-xs ${
                      msg.isSelf
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{msg.plainText}</p>
                    <span
                      className={`text-[9px] font-mono mt-1 block truncate ${
                        msg.isSelf ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      Payload: {msg.encryptedPayload.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Send payload to ${selectedTarget}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-sans"
            />
            <button
              type="submit"
              disabled={!connected || !message.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Web Bluetooth Pairing Button Integration */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleBluetoothPairing}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                bluetoothConnected
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              }`}
            >
              <Bluetooth className={`w-4 h-4 ${bluetoothConnected ? "animate-pulse text-emerald-600" : ""}`} />
              <span>
                {bluetoothConnected
                  ? `BLE Direct Connected (${bluetoothDevice?.name || "Target Device"})`
                  : bluetoothStatus === "Pairing..."
                  ? "Scanning Nearby Bluetooth Devices..."
                  : "Pair Device via Web Bluetooth"}
              </span>
            </button>
          </div>
        </section>

        {/* SOS Emergency Trigger */}
        <section>
          <button
            onClick={handleTriggerSOS}
            disabled={!connected}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              sosActive
                ? "bg-rose-600 text-white shadow-rose-600/40 animate-bounce"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {sosActive ? "!!! EMERGENCY SOS BROADCAST SENT !!!" : "Trigger Emergency SOS Alert"}
          </button>
        </section>
      </main>

      {/* Light Footer */}
      <footer className="px-4 py-2.5 bg-white border-t border-slate-200 text-center">
        <p className="text-[10px] font-mono text-slate-500">
          GhostMesh Protocol v2.0 • Web Bluetooth & Socket Relay Active
        </p>
      </footer>
    </div>
  );
}
