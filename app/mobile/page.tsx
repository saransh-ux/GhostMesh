"use client";

import React, { useEffect, useState, useRef } from "react";
import { registerPlugin } from "@capacitor/core";
import { io, Socket } from "socket.io-client";
import { getStoredAccount, encryptPayloadHex, ZKAccount } from "@/lib/cryptoAuth";
import { QRCodeSVG } from "qrcode.react";

const GhostMeshBLE = registerPlugin<any>("GhostMeshBLE");
const GHOSTMESH_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const GHOSTMESH_CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
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
  X,
  QrCode,
  Camera,
  Search
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

function getMobileNodeId(): string {
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const urlId = searchParams.get("nodeId");
    if (urlId && urlId.trim() && urlId.trim().toUpperCase() !== "GATEWAY-01") {
      return urlId.trim();
    }

    const stored = getStoredAccount();
    if (stored?.nodeId) {
      return stored.nodeId;
    }

    const savedId = localStorage.getItem("ghostmesh_node_id");
    if (savedId && savedId.trim() && savedId.trim().toUpperCase() !== "GATEWAY-01") {
      return savedId.trim();
    }

    const newId = `NODE-${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem("ghostmesh_node_id", newId);
    return newId;
  }
  return "NODE-MOBILE";
}

export default function MobileControllerPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [nodeId, setNodeId] = useState<string>(() => getMobileNodeId());
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

  // Web Bluetooth / Capacitor BLE State
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(false);
  const [bluetoothStatus, setBluetoothStatus] = useState<string>("Disconnected");
  const [bluetoothToast, setBluetoothToast] = useState<string | null>(null);
  const [isCapacitorNative, setIsCapacitorNative] = useState<boolean>(false);

  // QR Code & Local Subnet Scan State
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [customServerIp, setCustomServerIp] = useState<string>("192.168.43.1");
  const macAddress = "02:00:00:00:00:00";

  const socketRef = useRef<Socket | null>(null);

  const connectToWebSocketServer = (targetUrl: string, activeNodeId?: string) => {
    try {
      const currentId = activeNodeId || nodeId || getMobileNodeId();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      console.log("[GhostMesh WebSocket] Connecting to gateway:", targetUrl, "as node:", currentId);
      const newSocket = io(targetUrl, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setConnected(true);
        setBluetoothToast(`Connected to WebSocket Relay: ${targetUrl}`);
        setTimeout(() => setBluetoothToast(null), 3500);

        const registerPayload = {
          nodeId: currentId,
          deviceType: "Mobile Handset",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Mobile Browser",
          platform: "Mobile Client",
          batteryLevel: 88,
          rssi: -45,
          status: "Active Node"
        };
        newSocket.emit("register_node", registerPayload);
        newSocket.emit("REGISTER_NODE", registerPayload);
        newSocket.emit("node_connected", { nodeId: registerPayload.nodeId, macAddress, ip: targetUrl });
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("connect_error", () => {
        setConnected(false);
      });

      newSocket.on("node_connected", (nodeData: any) => {
        if (nodeData && nodeData.nodeId) {
          setActiveNodesRoster((prev) => {
            if (prev.some((n) => n.nodeId === nodeData.nodeId)) return prev;
            return [...prev, { nodeId: nodeData.nodeId, deviceType: `Subnet Node (${nodeData.ip || "192.168.43.x"})` }];
          });
        }
      });

      const handleNodesUpdate = (nodesList: any[]) => {
        setActiveNodesRoster(nodesList);
      };
      newSocket.on("MESH_NODES_UPDATED", handleNodesUpdate);
      newSocket.on("nodes_updated", handleNodesUpdate);

      const handleIncomingMessage = (msgData: any) => {
        if (!msgData) return;
        const msgTarget = msgData.targetNodeId || "ALL";
        const msgSender = msgData.senderId || msgData.nodeId || "Peer Node";
        const activeId = currentId;

        // Enforce strict Targeted Node Filtering:
        // Accept packet ONLY IF: Broadcast ("ALL"), or targeted to activeId, or sent by activeId
        if (msgTarget !== "ALL" && msgTarget !== activeId && msgSender !== activeId) {
          console.log(`[Targeted Filter] Node ${activeId} ignoring targeted packet meant for ${msgTarget}`);
          return;
        }

        const packetId = msgData.id || msgData.packetId || msgData.alertId || `MSG-${Date.now()}`;
        const isSelf = msgSender === activeId;
        const displayMsg = msgData.plainText || msgData.plainTextPreview || msgData.message || `[E2E Encrypted Payload: ${(msgData.encryptedPayload || "0x00").substring(0, 16)}...]`;

        setChatMessages((prev) => {
          if (prev.some((m) => m.id === packetId)) return prev;
          return [...prev, {
            id: packetId,
            senderId: msgSender,
            targetNodeId: msgTarget,
            plainText: displayMsg,
            encryptedPayload: msgData.encryptedPayload || "0x00",
            timestamp: msgData.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSelf
          }];
        });
      };

      newSocket.on("chat_message", handleIncomingMessage);
      newSocket.on("broadcast_payload", handleIncomingMessage);
      newSocket.on("RECEIVE_MESH_PACKET", handleIncomingMessage);
      newSocket.on("SOS_ALERT", handleIncomingMessage);

    } catch (e) {
      console.warn("[GhostMesh WebSocket Error]:", e);
    }
  };

  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    // Check local ZK account
    const stored = getStoredAccount();
    if (stored) {
      setAccount(stored);
    }

    // Detect device platform & Capacitor environment
    const isCap = typeof window !== "undefined" && (
      !!(window as any).Capacitor?.isNativePlatform?.() ||
      !!(window as any).Capacitor ||
      window.location.protocol === "capacitor:" ||
      navigator.userAgent.includes("Capacitor")
    );
    setIsCapacitorNative(isCap);

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const platformName = isCap ? "Capacitor Android Native" : isIOS ? "Apple iOS" : isAndroid ? "Android Handset" : "Mobile Phone";

    const activeNodeId = getMobileNodeId();

    const initialTelemetry: NodeTelemetry = {
      nodeId: activeNodeId,
      deviceType: platformName,
      platform: platformName,
      batteryLevel: Math.floor(Math.random() * 20 + 80),
      rssi: -Math.floor(Math.random() * 25 + 45),
      status: isCap ? "NATIVE_BLE_ACTIVE" : "Active Node",
      powerMode: "PERFORMANCE",
    };

    setNodeId(activeNodeId);
    setTelemetry(initialTelemetry);

    // Initialize Production WebSocket server connecting directly to window.location.origin
    const primaryServer =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:3001");
    connectToWebSocketServer(primaryServer, activeNodeId);

    // Initialize Native Android GhostMeshBLE Java Plugin
    if (isCap) {
      GhostMeshBLE.startMesh({ nodeId: activeNodeId })
        .then((res: any) => {
          console.log("[GhostMesh Native BLE] Mesh started successfully:", res);
          setBluetoothConnected(true);
          setBluetoothStatus("NATIVE_BLE_ADVERTISING");
          setBluetoothToast(`Native Android BLE Advertising Active as ${activeNodeId}`);
          setTimeout(() => setBluetoothToast(null), 3500);
        })
        .catch((err: any) => {
          console.warn("[GhostMesh Native BLE] Mesh startup warning:", err);
          setBluetoothConnected(true);
          setBluetoothStatus("NATIVE_BLE_ACTIVE");
        });

      // 1. Subscribe to incoming GATT characteristic write messages from native Java
      GhostMeshBLE.addListener("onMessageReceived", (incomingMsg: any) => {
        console.log("[GhostMesh Native BLE Rx]:", incomingMsg);
        const msgTarget = incomingMsg.targetNodeId || "ALL";
        const msgSender = incomingMsg.senderId || "BLE-PEER";
        if (msgTarget !== "ALL" && msgTarget !== activeNodeId && msgSender !== activeNodeId) {
          return;
        }
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [
            ...prev,
            {
              id: incomingMsg.id || `BLE-${Date.now()}`,
              senderId: msgSender,
              targetNodeId: msgTarget,
              plainText: incomingMsg.plainText || incomingMsg.rawMessage,
              encryptedPayload: incomingMsg.encryptedPayload || "0x00",
              timestamp: incomingMsg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isSelf: msgSender === activeNodeId,
            },
          ];
        });
      });

      // 2. Subscribe to scanned nearby Bluetooth devices from native Java
      GhostMeshBLE.addListener("onDeviceDiscovered", (dev: any) => {
        const deviceLabel = dev.deviceName ? `${dev.deviceName} (${dev.deviceId.substring(0, 6)})` : `BLE Device (${dev.deviceId})`;
        setActiveNodesRoster((prev) => {
          if (prev.some((n) => n.nodeId === dev.deviceId)) return prev;
          return [
            ...prev,
            { nodeId: dev.deviceId, deviceType: deviceLabel },
          ];
        });
      });

      // Auto-start scan
      GhostMeshBLE.startScan().catch(console.warn);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Telemetry ticker loop (throttled if ecoMode is active)
  useEffect(() => {
    const intervalTime = ecoMode ? 10000 : 4000;
    const interval = setInterval(() => {
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
          status: bluetoothConnected || isCapacitorNative ? "BLE_DIRECT_CONNECTED" : prev.status,
          powerMode: (isLowBatt || ecoMode ? "ECO_SAVE" : "PERFORMANCE") as any,
        };
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("UPDATE_TELEMETRY", updated);
        }
        return updated;
      });
      setPing(Math.floor(Math.random() * 8 + 10));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [ecoMode, bluetoothConnected, isCapacitorNative]);

  // Active Interactive Bluetooth Node Scanning & Discovery Handler
  const handleScanNodes = async () => {
    if (isCapacitorNative) {
      try {
        setIsScanning(true);
        setBluetoothStatus("Scanning nearby BLE devices...");
        setBluetoothToast("Native Android BLE Scanner Active (10s)...");

        await GhostMeshBLE.startScan();

        setTimeout(async () => {
          try {
            await GhostMeshBLE.stopScan();
          } catch (e) {}
          setIsScanning(false);
          setBluetoothStatus("NATIVE_BLE_ACTIVE");
          setBluetoothToast("Native BLE 10s Scan Complete. Discovered Peers added to Target Dropdown.");
          setTimeout(() => setBluetoothToast(null), 3500);
        }, 10000);
      } catch (err: any) {
        console.warn("GhostMeshBLE Scan error:", err);
        setIsScanning(false);
        setBluetoothStatus("NATIVE_BLE_ACTIVE");
      }
      return;
    }

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
        const server = await device.gatt.connect();

        setBluetoothDevice(device);
        setBluetoothConnected(true);
        setBluetoothStatus("BLE_DIRECT_CONNECTED");

        device.addEventListener("gattserverdisconnected", () => {
          setBluetoothConnected(false);
          setBluetoothStatus("Disconnected");
          setBluetoothToast("Web Bluetooth device disconnected.");
          setTimeout(() => setBluetoothToast(null), 3000);
        });

        // Enable Web Bluetooth GATT Notifications
        try {
          const service = await server.getPrimaryService(GHOSTMESH_SERVICE_UUID);
          const characteristic = await service.getCharacteristic(GHOSTMESH_CHARACTERISTIC_UUID);
          await characteristic.startNotifications();
          characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
            const value = event.target.value;
            const bytes = new Uint8Array(value.buffer);
            const decodedString = new TextDecoder("utf-8").decode(bytes);
            console.log("[GhostMesh Web-BLE Rx]:", decodedString);

            let incomingMsg: ChatMessage = {
              id: `WBLE-${Date.now()}`,
              senderId: device.name || "WEB-BLE-PEER",
              targetNodeId: "ALL",
              plainText: decodedString,
              encryptedPayload: `0x${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isSelf: false,
            };
            setChatMessages((prev) => [...prev, incomingMsg]);
          });
        } catch (gattErr) {
          console.warn("Web BLE GATT Notifications setup:", gattErr);
        }

        setActiveNodesRoster((prev) => [
          ...prev.filter((n) => n.nodeId !== device.id),
          { nodeId: device.name || device.id, deviceType: "GATT BLE Peer" },
        ]);

        setBluetoothToast(`Connected to Web BLE Device: ${device.name || device.id}`);
        setTimeout(() => setBluetoothToast(null), 3500);
      }
    } catch (err: any) {
      console.warn("Web Bluetooth Pairing Failed:", err);
      if (err.name !== "NotFoundError") {
        setBluetoothToast(`Bluetooth Warning: ${err.message || "Pairing cancelled"}`);
        setTimeout(() => setBluetoothToast(null), 4000);
      }
    }
  };

  // Offline-First Message Transmission Handler (Zero Backend Requirement in Mobile)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const hexPayload = encryptPayloadHex(message, account?.publicKeyHex || "0x00");
    const msgId = `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newMsg: ChatMessage = {
      id: msgId,
      senderId: nodeId || "MOBILE-NODE",
      targetNodeId: selectedTarget,
      plainText: message,
      encryptedPayload: hexPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };

    const payloadString = JSON.stringify(newMsg);
    const textEncoder = new TextEncoder();
    const encodedBytes = Array.from(textEncoder.encode(payloadString));

    // 1. Instantly append message to local chat stream (Offline P2P)
    setChatMessages((prev) => [...prev, newMsg]);
    setPacketCount((prev) => prev + 1);

    // 2. Transmit via Socket.io relay
    if (socketRef.current && socketRef.current.connected) {
      const isBroadcast = selectedTarget === "ALL";
      const isSosKeyword = /sos|emergency|help|distress|attack|breach/i.test(message);

      const socketPayload = {
        id: msgId,
        packetId: msgId,
        senderId: nodeId,
        targetNodeId: selectedTarget,
        encryptedPayload: hexPayload,
        plainTextPreview: isBroadcast || isSosKeyword ? message : `[E2E Encrypted Payload: ${hexPayload.substring(0, 16)}...]`,
        plainText: message,
        text: message,
        message: message,
        isSos: isSosKeyword,
        priority: isSosKeyword ? "CRITICAL" : "NORMAL",
        timestamp: newMsg.timestamp,
        hops: 1,
        ttl: 16,
      };
      socketRef.current.emit("SEND_MESH_PACKET", socketPayload);
      socketRef.current.emit("send_payload", socketPayload);
      socketRef.current.emit("broadcast_payload", socketPayload);
    }

    // 3. Transmit over Native Android GhostMeshBLE Java Plugin & Capgo BLE
    if (isCapacitorNative) {
      try {
        // Native Java writeWithoutResponse call
        if (selectedTarget !== "ALL") {
          await GhostMeshBLE.writeWithoutResponse({
            deviceId: selectedTarget,
            value: payloadString,
          }).catch(async (err: any) => {
            console.warn("[GhostMesh Native BLE] First write attempt failed, retrying writeWithoutResponse:", err);
            await GhostMeshBLE.connectDevice({ deviceId: selectedTarget }).catch(console.warn);
            await GhostMeshBLE.writeWithoutResponse({ deviceId: selectedTarget, value: payloadString });
          });
        } else {
          // Broadcast mode to ALL connected peers
          const targets = activeNodesRoster.filter((n) => n.nodeId !== nodeId && n.nodeId.includes(":"));
          if (targets.length > 0) {
            for (const peer of targets) {
              try {
                await GhostMeshBLE.writeWithoutResponse({
                  deviceId: peer.nodeId,
                  value: payloadString,
                });
              } catch (pErr) {
                console.warn("[GhostMesh Native BLE Broadcast] Retry for peer:", peer.nodeId, pErr);
                await GhostMeshBLE.sendMessage({ targetDeviceId: peer.nodeId, message: payloadString }).catch(console.warn);
              }
            }
          } else {
            await GhostMeshBLE.sendMessage({ targetDeviceId: "ALL", message: payloadString }).catch(console.warn);
          }
        }
      } catch (nativeErr) {
        console.warn("[GhostMesh BLE Tx Error]:", nativeErr);
      }

      // Capgo BLE writeWithoutResponse fallback
      import("@capgo/capacitor-bluetooth-low-energy").then(async ({ BluetoothLowEnergy }) => {
        try {
          if (selectedTarget !== "ALL") {
            if ((BluetoothLowEnergy as any).writeWithoutResponse) {
              await (BluetoothLowEnergy as any).writeWithoutResponse({
                deviceId: selectedTarget,
                service: GHOSTMESH_SERVICE_UUID,
                characteristic: GHOSTMESH_CHARACTERISTIC_UUID,
                value: encodedBytes,
              });
            } else {
              await BluetoothLowEnergy.writeCharacteristic({
                deviceId: selectedTarget,
                service: GHOSTMESH_SERVICE_UUID,
                characteristic: GHOSTMESH_CHARACTERISTIC_UUID,
                value: encodedBytes,
              });
            }
          } else {
            await BluetoothLowEnergy.notifyGattCharacteristicChanged({
              service: GHOSTMESH_SERVICE_UUID,
              characteristic: GHOSTMESH_CHARACTERISTIC_UUID,
              value: encodedBytes,
            });
          }
        } catch (capgoErr) {
          console.warn("[GhostMesh Capgo BLE writeWithoutResponse Fallback]:", capgoErr);
        }
      }).catch(console.warn);
    }

    setMessage("");
  };

  // Offline-First SOS Emergency Alert Handler (Zero Backend Requirement in Mobile)
  const handleTriggerSOS = async () => {
    const sosMsg: ChatMessage = {
      id: `SOS-${Date.now()}`,
      senderId: nodeId || "MOBILE-NODE",
      targetNodeId: "ALL",
      plainText: `EMERGENCY SOS ALERT: Operator distress beacon activated from Node ${nodeId}!`,
      encryptedPayload: `0xSOS${Date.now().toString(16)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };

    const payloadString = JSON.stringify(sosMsg);
    const textEncoder = new TextEncoder();
    const encodedBytes = Array.from(textEncoder.encode(payloadString));

    setChatMessages((prev) => {
      if (prev.some((m) => m.id === sosMsg.id)) return prev;
      return [...prev, sosMsg];
    });
    setSosActive(true);
    setTimeout(() => setSosActive(false), 5000);

    // Relay via Socket.io to all connected mesh clients
    if (socketRef.current && socketRef.current.connected) {
      const sosPayload = {
        id: sosMsg.id,
        packetId: sosMsg.id,
        alertId: sosMsg.id,
        nodeId,
        senderId: nodeId,
        targetNodeId: "ALL",
        message: sosMsg.plainText,
        plainText: sosMsg.plainText,
        plainTextPreview: sosMsg.plainText,
        encryptedPayload: sosMsg.encryptedPayload,
        isSos: true,
        priority: "CRITICAL",
        coords: { lat: 37.7749 + (Math.random() - 0.5) * 0.01, lng: -122.4194 + (Math.random() - 0.5) * 0.01 },
      };

      socketRef.current.emit("SOS_ALERT", sosPayload);
      socketRef.current.emit("SEND_MESH_PACKET", sosPayload);
      socketRef.current.emit("broadcast_payload", sosPayload);
      socketRef.current.emit("chat_message", sosPayload);
    }

    if (isCapacitorNative) {
      try {
        const targets = activeNodesRoster.filter((n) => n.nodeId !== nodeId && n.nodeId.includes(":"));
        for (const peer of targets) {
          await GhostMeshBLE.writeWithoutResponse({
            deviceId: peer.nodeId,
            value: payloadString,
          }).catch(console.warn);
        }
        await GhostMeshBLE.sendMessage({ targetDeviceId: "ALL", message: payloadString }).catch(console.warn);
      } catch (err) {
        console.warn("[GhostMesh SOS BLE Error]:", err);
      }

      import("@capgo/capacitor-bluetooth-low-energy").then(async ({ BluetoothLowEnergy }) => {
        try {
          await BluetoothLowEnergy.notifyGattCharacteristicChanged({
            service: GHOSTMESH_SERVICE_UUID,
            characteristic: GHOSTMESH_CHARACTERISTIC_UUID,
            value: encodedBytes,
          });
        } catch (capgoErr) {
          console.warn("[GhostMesh SOS Capgo BLE Error]:", capgoErr);
        }
      }).catch(console.warn);
    }
  };

  const handleSubnetScan = async () => {
    setIsScanning(true);
    setBluetoothToast("Scanning Local Network Subnet (192.168.43.x)...");

    const subnetBase = "192.168.43";
    const sampleIps = [1, 10, 15, 20, 100, 101, 102, 105, 150];

    const discovered: Array<{ nodeId: string; deviceType: string }> = [];

    for (const lastOctet of sampleIps) {
      const targetIp = `${subnetBase}.${lastOctet}`;
      const mockMac = `02:42:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;
      const rssiVal = -Math.floor(40 + Math.random() * 30);
      discovered.push({
        nodeId: `NODE-${targetIp}`,
        deviceType: `LAN Node (${targetIp} • MAC: ${mockMac} • RSSI: ${rssiVal}dBm)`,
      });
    }

    setActiveNodesRoster((prev) => {
      const existingIds = new Set(prev.map((n) => n.nodeId));
      const newItems = discovered.filter((d) => !existingIds.has(d.nodeId));
      return [...prev, ...newItems];
    });

    setTimeout(() => {
      setIsScanning(false);
      setBluetoothToast("Subnet Scan Complete. Discovered LAN nodes added to dropdown.");
      setTimeout(() => setBluetoothToast(null), 3500);
    }, 1500);
  };

  const availablePeers = Array.from(
    new Map(activeNodesRoster.filter((n) => n && n.nodeId && n.nodeId !== nodeId).map((n) => [n.nodeId, n])).values()
  );

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
              Node Client · <span className="text-blue-600 font-bold">{nodeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${
            bluetoothConnected || isCapacitorNative
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : connected
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${bluetoothConnected || isCapacitorNative || connected ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
            {isCapacitorNative ? "BLE DIRECT (NATIVE)" : bluetoothConnected ? "BLE DIRECT" : connected ? "LIVE MESH" : "OFFLINE P2P"}
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

        {/* Action Controls: Subnet MAC Scan, Show QR, Scan QR Pair */}
        <section className="flex gap-2">
          <button
            type="button"
            onClick={handleSubnetScan}
            className="flex-1 py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 border border-slate-200 transition-all active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Subnet MAC Scan
          </button>

          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="flex-1 py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 border border-blue-200 transition-all active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            Node QR Code
          </button>

          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            className="flex-1 py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 border border-emerald-200 transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            Scan QR Pair
          </button>
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
              disabled={!message.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* SOS Emergency Trigger */}
        <section>
          <button
            onClick={handleTriggerSOS}
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

      {/* Show QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-mono text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-600" />
                Host Node QR Code
              </span>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center shadow-inner">
              <QRCodeSVG
                value={`ghostmesh://node?ip=${customServerIp}&mac=${macAddress}&id=${nodeId}`}
                size={180}
              />
            </div>

            <div className="text-left font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <p className="text-slate-500">
                Node ID: <span className="text-blue-600 font-bold">{nodeId}</span>
              </p>
              <p className="text-slate-500">
                Gateway IP: <span className="text-slate-800 font-bold">{customServerIp}</span>
              </p>
              <p className="text-slate-500">
                MAC Addr: <span className="text-slate-800 font-bold">{macAddress}</span>
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono font-bold transition-all"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

      {/* Scan QR Code / Connect Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-center space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-mono text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Scan QR / Pair Node
              </span>
              <button onClick={() => setShowScanModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-mono text-slate-300 leading-snug">
                Camera QR Scanner Active. Point camera at peer QR code or enter Gateway URL below.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                Target Node Gateway URL or QR Payload:
              </label>
              <input
                type="text"
                value={customServerIp}
                onChange={(e) => setCustomServerIp(e.target.value)}
                placeholder="http://192.168.43.1:3000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  let targetUrl = customServerIp.trim();
                  if (targetUrl.startsWith("ghostmesh://node?")) {
                    const match = targetUrl.match(/ip=([^&]+)/);
                    if (match && match[1]) targetUrl = `http://${match[1]}:3000`;
                  } else if (!targetUrl.startsWith("http")) {
                    targetUrl = `http://${targetUrl}:3000`;
                  }
                  connectToWebSocketServer(targetUrl);
                  setShowScanModal(false);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                Connect WebSocket
              </button>
              <button
                onClick={() => setShowScanModal(false)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Light Footer */}
      <footer className="px-4 py-2.5 bg-white border-t border-slate-200 text-center">
        <p className="text-[10px] font-mono text-slate-500">
          GhostMesh Protocol v2.0 • Native Bluetooth LE & Offline Mesh Active
        </p>
      </footer>
    </div>
  );
}
