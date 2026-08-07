"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  createZKAccount, 
  getStoredAccount, 
  clearAccount, 
  ZKAccount 
} from "@/lib/cryptoAuth";
import { 
  ShieldCheck, 
  Key, 
  Radio, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Lock,
  UserCheck,
  AlertCircle
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [account, setAccount] = useState<ZKAccount | null>(null);
  const [alias, setAlias] = useState("Tactical Operator");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const existing = getStoredAccount();
    if (existing) {
      setAccount(existing);
    }
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(async () => {
      const newAcc = await createZKAccount(alias || "Tactical Operator");
      setAccount(newAcc);
      setIsGenerating(false);
    }, 400);
  };

  const handleClearAccount = () => {
    clearAccount();
    setAccount(null);
  };

  const handleCopyPubKey = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.publicKeyHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-container-max mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">GhostMesh ZK</span>
              <p className="text-[11px] font-mono text-slate-500">Offline Cryptographic Identity</p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full flex flex-col justify-center">
        {account ? (
          /* Active Account State */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{account.alias}</h2>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      ZK ACTIVE
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">Node ID: {account.nodeId}</p>
                </div>
              </div>

              <button
                onClick={handleClearAccount}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
              >
                Reset Keys
              </button>
            </div>

            {/* Public Key Display */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                Curve25519 Public Key
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between font-mono text-xs text-slate-800">
                <span className="truncate mr-3">{account.publicKeyHex}</span>
                <button
                  onClick={handleCopyPubKey}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Seed Phrase */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                12-Word Offline Recovery Seed
              </label>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs grid grid-cols-3 gap-2 border border-slate-800">
                {account.seedPhrase.split(" ").map((word, idx) => (
                  <div key={idx} className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 flex gap-2">
                    <span className="text-slate-500">{idx + 1}.</span>
                    <span className="text-blue-300 font-semibold">{word}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/mobile"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch Mobile Phone Client</span>
              </Link>
              <Link
                href="/dashboard"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Go to Command Center</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Create Account Form */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Create Zero-Knowledge Identity</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate an offline Curve25519 cryptographic keypair directly in your browser. No server required.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Node Alias / Call Sign
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="e.g. Tactical Operator Alpha"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deriving Cryptographic Keypair...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Generate Offline ZK Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Zero-Knowledge architecture guarantees your private key never leaves local storage. Mesh packets are signed locally before broadcast.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs font-mono text-slate-500">
        GhostMesh ZK Protocol v2.0 • Offline Curve25519 Encryption
      </footer>
    </div>
  );
}
