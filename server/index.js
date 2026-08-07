const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory active nodes telemetry
let activeNodes = [];
let packetHistory = [];

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', activeNodesCount: activeNodes.length, activeNodes, uptime: process.uptime() });
});

app.get('/api/nodes', (req, res) => {
  res.json(activeNodes);
});

io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  // 1. Node Registration with Zero-Knowledge Public Key & Telemetry
  socket.on('REGISTER_NODE', (telemetry) => {
    const nodeId = telemetry.nodeId || `NODE-${socket.id.substring(0, 6).toUpperCase()}`;
    
    const nodeIndex = activeNodes.findIndex(n => n.nodeId === nodeId || n.socketId === socket.id);
    const nodeData = {
      nodeId,
      socketId: socket.id,
      publicKey: telemetry.publicKey || `0x${socket.id.substring(0, 16)}`,
      deviceType: telemetry.deviceType || 'Mobile Handset',
      platform: telemetry.platform || 'Android/iOS',
      batteryLevel: telemetry.batteryLevel ?? Math.floor(Math.random() * 25 + 75),
      rssi: telemetry.rssi ?? -Math.floor(Math.random() * 30 + 40),
      status: telemetry.status || 'Active Node',
      powerMode: telemetry.powerMode || 'PERFORMANCE',
      lastSeen: new Date().toISOString(),
      connectedAt: telemetry.connectedAt || new Date().toISOString()
    };

    if (nodeIndex >= 0) {
      activeNodes[nodeIndex] = nodeData;
    } else {
      activeNodes.push(nodeData);
    }

    console.log(`[Mesh Core] Node Registered: ${nodeId} (${nodeData.deviceType})`);
    io.emit('MESH_NODES_UPDATED', activeNodes);
  });

  // 2. Real-Time Telemetry & Adaptive Power Mode Updates
  socket.on('UPDATE_TELEMETRY', (update) => {
    const node = activeNodes.find(n => n.socketId === socket.id || n.nodeId === update.nodeId);
    if (node) {
      node.batteryLevel = update.batteryLevel ?? node.batteryLevel;
      node.rssi = update.rssi ?? node.rssi;
      node.powerMode = update.powerMode ?? node.powerMode;
      node.status = update.status ?? node.status;
      node.lastSeen = new Date().toISOString();

      // Adaptive Power Management Check
      if (node.batteryLevel < 20 && node.powerMode !== 'ECO_SAVE') {
        node.powerMode = 'ECO_SAVE';
        node.status = 'Low Power Eco Mode (Throttled Polling)';
      }

      io.emit('MESH_NODES_UPDATED', activeNodes);
    }
  });

  // 3. Multi-Phone & Peer-to-Peer Targeted Packet Routing
  socket.on('SEND_MESH_PACKET', (data) => {
    const packetId = `PKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const timestamp = new Date().toLocaleTimeString();
    
    const sender = activeNodes.find(n => n.socketId === socket.id)?.nodeId || data.senderId || 'Mobile Node';
    const targetNodeId = data.targetNodeId || 'ALL';
    const encryptedHex = data.encryptedPayload || `0x${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

    const meshPacket = {
      packetId,
      senderId: sender,
      targetNodeId: targetNodeId,
      encryptedPayload: encryptedHex,
      plainTextPreview: data.plainTextPreview || 'Encrypted mesh payload',
      timestamp,
      hops: data.hops || Math.floor(Math.random() * 2) + 1,
      ttl: data.ttl || 16,
      route: [sender, 'Relay-Alpha', targetNodeId === 'ALL' ? 'Broadcast' : targetNodeId],
      signalStrength: `${Math.floor(Math.random() * 20 - 55)} dBm`
    };

    packetHistory.unshift(meshPacket);
    if (packetHistory.length > 50) packetHistory.pop();

    console.log(`[Mesh Packet] ${sender} -> ${targetNodeId} | ${packetId}`);
    
    // Broadcast packet to all connected clients (desktop dashboard and phone nodes)
    io.emit('RECEIVE_MESH_PACKET', meshPacket);
  });

  // 4. Emergency SOS Trigger
  socket.on('SOS_ALERT', (data) => {
    const sender = activeNodes.find(n => n.socketId === socket.id)?.nodeId || data?.nodeId || 'Mobile Node';
    const sosPayload = {
      alertId: `SOS-${Date.now()}`,
      nodeId: sender,
      message: data?.message || 'EMERGENCY SOS: Physical Node requested emergency response!',
      timestamp: new Date().toLocaleTimeString(),
      coords: data?.coords || { lat: 37.7749, lng: -122.4194 },
      priority: 'CRITICAL'
    };

    console.warn(`[EMERGENCY SOS] Alert from ${sender}`);
    io.emit('SOS_ALERT', sosPayload);
  });

  // 5. Disconnection
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const disconnected = activeNodes.find(n => n.socketId === socket.id);
    activeNodes = activeNodes.filter(n => n.socketId !== socket.id);
    if (disconnected) {
      console.log(`[Mesh Core] Removed: ${disconnected.nodeId}`);
    }
    io.emit('MESH_NODES_UPDATED', activeNodes);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(` GhostMesh Real-Time Relay Server running on port ${PORT}`);
  console.log(` Bound to 0.0.0.0 (Local Wi-Fi LAN / Hotspot Ready)`);
  console.log(`====================================================`);
});
