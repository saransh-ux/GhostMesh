"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  ShieldAlert, 
  Filter, 
  Download, 
  RotateCcw, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileCode, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  ArrowUpDown,
  Lock,
  ChevronRight
} from "lucide-react";

export type ReviewStatus = "UNREVIEWED" | "SUSPECTED" | "VERIFIED" | "NEEDS_REVIEW";
export type RiskSeverity = "HIGH" | "MEDIUM" | "LOW";
export type MediaType = "IMAGE" | "VIDEO" | "TEXT";

export interface SecurityCase {
  caseId: string;
  timestamp: string;
  riskSeverity: RiskSeverity;
  confidenceScore: number; // 0.00 to 1.00
  mediaType: MediaType;
  mediaHash: string;
  systemExplanation: string;
  reviewStatus: ReviewStatus;
  investigatorNotes: string;
  sourceNodeId: string;
}

const INITIAL_CASES: SecurityCase[] = [
  {
    caseId: "CASE-2026-8801",
    timestamp: "2026-08-08T04:15:22Z",
    riskSeverity: "HIGH",
    confidenceScore: 0.985,
    mediaType: "IMAGE",
    mediaHash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    systemExplanation: "High-probability steganographic payload detected within BLE radio packet fragment. Neural inspector flagged byte anomaly sequence matching known covert exfiltration signatures.",
    reviewStatus: "SUSPECTED",
    investigatorNotes: "Steganographic payload flagged during BLE packet relay. Isolated node NODE-944621 for deep forensic analysis.",
    sourceNodeId: "NODE-944621"
  },
  {
    caseId: "CASE-2026-8802",
    timestamp: "2026-08-08T03:50:10Z",
    riskSeverity: "HIGH",
    confidenceScore: 0.942,
    mediaType: "VIDEO",
    mediaHash: "0x8f4b2190a6e3d21c4568b201e76543219087654321098765432109876543210a",
    systemExplanation: "Deepfake manipulation artifact detected in mesh video stream. Frame-level facial landmark jitter inconsistency observed across 42 consecutive frames.",
    reviewStatus: "VERIFIED",
    investigatorNotes: "Confirmed manipulated video stream injected via rogue relay gateway. Revoked keypair signature.",
    sourceNodeId: "NODE-243148"
  },
  {
    caseId: "CASE-2026-8803",
    timestamp: "2026-08-08T02:11:45Z",
    riskSeverity: "MEDIUM",
    confidenceScore: 0.815,
    mediaType: "TEXT",
    mediaHash: "0x7a3c9e2b1d5f8a0c4e6b2d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e2b1d5f8a0c",
    systemExplanation: "Automated phishing pattern matched in plainText payload snippet. High entropy cipher text block detected preceding command sequence.",
    reviewStatus: "NEEDS_REVIEW",
    investigatorNotes: "Pending secondary review by L2 security analyst. Potential false positive on encoded telemetry.",
    sourceNodeId: "NODE-112049"
  },
  {
    caseId: "CASE-2026-8804",
    timestamp: "2026-08-08T01:05:00Z",
    riskSeverity: "HIGH",
    confidenceScore: 0.890,
    mediaType: "IMAGE",
    mediaHash: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    systemExplanation: "Exfiltrated schematic diagram detected via structural feature matching model. Watermark matches classified internal blueprint repository.",
    reviewStatus: "UNREVIEWED",
    investigatorNotes: "",
    sourceNodeId: "NODE-883012"
  },
  {
    caseId: "CASE-2026-8805",
    timestamp: "2026-08-07T23:44:12Z",
    riskSeverity: "MEDIUM",
    confidenceScore: 0.735,
    mediaType: "VIDEO",
    mediaHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
    systemExplanation: "Anomalous camera feed distortion detected. Packet loss pattern aligns with active RF jammer interference in grid sector 4.",
    reviewStatus: "UNREVIEWED",
    investigatorNotes: "",
    sourceNodeId: "GATEWAY-01"
  },
  {
    caseId: "CASE-2026-8806",
    timestamp: "2026-08-07T21:18:30Z",
    riskSeverity: "LOW",
    confidenceScore: 0.520,
    mediaType: "TEXT",
    mediaHash: "0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b",
    systemExplanation: "Minor character set anomaly in mesh handshake packet. Likely uncalibrated mobile device locale format.",
    reviewStatus: "UNREVIEWED",
    investigatorNotes: "",
    sourceNodeId: "NODE-554109"
  },
  {
    caseId: "CASE-2026-8807",
    timestamp: "2026-08-07T19:02:11Z",
    riskSeverity: "LOW",
    confidenceScore: 0.450,
    mediaType: "IMAGE",
    mediaHash: "0x5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e",
    systemExplanation: "Low confidence noise threshold artifact detected in image header EXIF metadata. Standard compressed camera output.",
    reviewStatus: "VERIFIED",
    investigatorNotes: "Benign camera artifact verified. No threat action required.",
    sourceNodeId: "NODE-772901"
  }
];

export default function SecurityCasesPage() {
  const [cases, setCases] = useState<SecurityCase[]>(INITIAL_CASES);
  
  // Filter States
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Handle Case Status Update
  const handleStatusChange = (caseId: string, newStatus: ReviewStatus) => {
    setCases((prev) =>
      prev.map((c) => (c.caseId === caseId ? { ...c, reviewStatus: newStatus } : c))
    );
  };

  // Handle Investigator Notes Update
  const handleNotesChange = (caseId: string, notes: string) => {
    setCases((prev) =>
      prev.map((c) => (c.caseId === caseId ? { ...c, investigatorNotes: notes } : c))
    );
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSeverityFilter("ALL");
    setMediaTypeFilter("ALL");
    setStatusFilter("ALL");
  };

  // Filtered & Descending Confidence Score Sorted Queue
  const filteredCases = useMemo(() => {
    return cases
      .filter((item) => {
        if (severityFilter !== "ALL" && item.riskSeverity !== severityFilter) return false;
        if (mediaTypeFilter !== "ALL" && item.mediaType !== mediaTypeFilter) return false;
        if (statusFilter !== "ALL" && item.reviewStatus !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }, [cases, severityFilter, mediaTypeFilter, statusFilter]);

  // Generate & Trigger Evidence Brief Markdown Download
  const handleDownloadBrief = (item: SecurityCase) => {
    const markdownContent = `# Security Evidence Brief: ${item.caseId}

- **Case ID**: ${item.caseId}
- **Timestamp**: ${item.timestamp}
- **Risk Severity**: ${item.riskSeverity}
- **Confidence Score**: ${(item.confidenceScore * 100).toFixed(1)}%
- **Source Node**: ${item.sourceNodeId}

## Media Metadata
- **Media Type**: ${item.mediaType}
- **SHA-256 Hash**: \`${item.mediaHash}\`

## System Threat Explanation
${item.systemExplanation}

## Review Status & Investigator Audit Notes
- **Current Review Status**: ${item.reviewStatus}
- **Investigator Audit Notes**: ${item.investigatorNotes.trim() ? item.investigatorNotes : "No audit notes recorded."}

---
*Generated by GhostMesh Zero-Trust Security Case Audit Engine v2.0*
`;

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Brief_${item.caseId}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Visual status badge helper
  const renderStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            VERIFIED THREAT
          </span>
        );
      case "SUSPECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            SUSPECTED
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            NEEDS REVIEW
          </span>
        );
      case "UNREVIEWED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            UNREVIEWED
          </span>
        );
    }
  };

  // Severity badge helper
  const renderSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case "HIGH":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
            HIGH RISK
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
            MEDIUM RISK
          </span>
        );
      case "LOW":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-200">
            LOW RISK
          </span>
        );
    }
  };

  // Media icon helper
  const renderMediaIcon = (type: MediaType) => {
    switch (type) {
      case "IMAGE":
        return <FileImage className="w-4 h-4 text-cyan-400" />;
      case "VIDEO":
        return <FileVideo className="w-4 h-4 text-purple-400" />;
      case "TEXT":
        return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        activeTab="security"
        setActiveTab={() => {}}
        activeNodesCount={3}
        isConnected={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold mb-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>GhostMesh Threat Intelligence Core</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Security Case Review Queue
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-bold">
                {filteredCases.length} Record{filteredCases.length !== 1 ? "s" : ""} Total
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Audit suspicious mesh payloads, tag investigation labels, and export cryptographic evidence briefs.
            </p>
          </div>

          <Link
            href="/"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-2 transition-all"
          >
            <span>Return to Live Command Center</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* ELITE BOUNTY: Queue Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300 font-bold uppercase tracking-wider">
              <Filter className="w-4 h-4 text-blue-400" />
              <span>Queue Filter Matrix</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Sorted Descending by <strong>Confidence Score</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Risk Severity Filter */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-400 font-bold">
                Risk Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="ALL">ALL SEVERITIES</option>
                <option value="HIGH">HIGH SEVERITY</option>
                <option value="MEDIUM">MEDIUM SEVERITY</option>
                <option value="LOW">LOW SEVERITY</option>
              </select>
            </div>

            {/* Media Type Filter */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-400 font-bold">
                Media Type
              </label>
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="ALL">ALL MEDIA TYPES</option>
                <option value="IMAGE">IMAGE (Steganography / Visuals)</option>
                <option value="VIDEO">VIDEO (Deepfakes / Feeds)</option>
                <option value="TEXT">TEXT (Cipher / Command)</option>
              </select>
            </div>

            {/* Review Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-400 font-bold">
                Review Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="ALL">ALL REVIEW STATUSES</option>
                <option value="UNREVIEWED">UNREVIEWED</option>
                <option value="SUSPECTED">SUSPECTED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="NEEDS_REVIEW">NEEDS REVIEW</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Case Records List */}
        <div className="space-y-6">
          {filteredCases.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">No Security Cases Match Selected Filters</h3>
              <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                Try resetting your severity, media type, or status filters to view historical records.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-2 mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            filteredCases.map((item) => (
              <div
                key={item.caseId}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 hover:border-slate-700 transition-all"
              >
                {/* Case Card Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-200">
                      {renderMediaIcon(item.mediaType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-white tracking-tight">
                          {item.caseId}
                        </span>
                        {renderSeverityBadge(item.riskSeverity)}
                        {renderStatusBadge(item.reviewStatus)}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Detected: {item.timestamp} • Source Node: <strong className="text-blue-400">{item.sourceNodeId}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Confidence Score Gauge & Download Button */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        AI Threat Confidence
                      </span>
                      <span className="text-base font-mono font-extrabold text-cyan-400">
                        {(item.confidenceScore * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* ADVANCED BOUNTY: Download Evidence Brief Button */}
                    <button
                      onClick={() => handleDownloadBrief(item)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Evidence Brief</span>
                    </button>
                  </div>
                </div>

                {/* System Threat Explanation & Metadata Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: System Explanation & SHA-256 Hash */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      System Detection Explanation
                    </h4>
                    <p className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                      {item.systemExplanation}
                    </p>

                    <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">SHA-256: <strong className="text-slate-300">{item.mediaHash}</strong></span>
                    </div>
                  </div>

                  {/* Right: CORE BOUNTY - Investigation Controls */}
                  <div className="lg:col-span-5 space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                    {/* Status Selector Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                        Set Investigation Review Label
                      </label>
                      <select
                        value={item.reviewStatus}
                        onChange={(e) => handleStatusChange(item.caseId, e.target.value as ReviewStatus)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="UNREVIEWED">UNREVIEWED (Pending Analyst Audit)</option>
                        <option value="SUSPECTED">SUSPECTED (Flagged Security Anomaly)</option>
                        <option value="VERIFIED">VERIFIED (Confirmed Malicious Threat)</option>
                        <option value="NEEDS_REVIEW">NEEDS REVIEW (Secondary L2 Escalate)</option>
                      </select>
                    </div>

                    {/* Investigator Audit Notes Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                        Investigator Audit Notes
                      </label>
                      <textarea
                        rows={3}
                        value={item.investigatorNotes}
                        onChange={(e) => handleNotesChange(item.caseId, e.target.value)}
                        placeholder="Enter forensic audit notes, node quarantine status, or incident response log..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
