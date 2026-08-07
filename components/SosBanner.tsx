"use client";

import React from "react";
import { AlertTriangle, X, Radio, MapPin, ShieldAlert } from "lucide-react";

export interface SosAlertData {
  alertId: string;
  nodeId: string;
  message: string;
  timestamp: string;
  coords?: { lat: number; lng: number };
  priority?: string;
}

interface SosBannerProps {
  alert: SosAlertData | null;
  onDismiss: () => void;
}

export default function SosBanner({ alert, onDismiss }: SosBannerProps) {
  if (!alert) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-sos">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl shadow-rose-950/80 text-white backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/50 animate-bounce">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                CRITICAL SOS ALERT
              </span>
              <span className="text-xs font-mono text-rose-300">[{alert.timestamp}]</span>
            </div>
            <h4 className="font-bold text-sm text-white mt-1 leading-snug font-sans">
              Node <span className="font-mono text-rose-200 underline">{alert.nodeId}</span>: {alert.message}
            </h4>
            {alert.coords && (
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-mono mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>GPS Coords: {alert.coords.lat.toFixed(4)}, {alert.coords.lng.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white transition-colors shrink-0 border border-rose-700"
          title="Dismiss Alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
