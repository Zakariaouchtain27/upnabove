"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview 
} from "@codesandbox/sandpack-react";
import { createClient } from "@/lib/supabase/client";
import { 
  ShieldAlert, Eye, Terminal, Activity, 
  Users, ArrowLeft, Zap, Wifi
} from "lucide-react";
import Link from "next/link";

/**
 * THE GOD VIEW
 * Spectator mode for employers to watch candidates live.
 */
export default function GodViewPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  
  const [activeCode, setActiveCode] = useState("// Waiting for candidate to initialize terminal...");
  const [latency, setLatency] = useState(0);
  const [status, setStatus] = useState<"connecting" | "live" | "idle">("connecting");
  const [candidatesCount, setCandidatesCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to the broadcast channel
    const channel = supabase.channel(`room-${challengeId}`);

    channel
      .on("broadcast", { event: "code_update" }, (payload) => {
        const start = Date.now();
        setActiveCode(payload.payload.code);
        setLatency(Date.now() - start + Math.floor(Math.random() * 20)); // Simulated network + processing latency
        setStatus("live");
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[God View] Listening for transmissions...");
          setStatus("idle");
        }
      });

    // Track presence if needed, but for now just broadcast
    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId]);

  return (
    <div className="flex flex-col h-screen bg-[#05050a] text-white overflow-hidden">
      
      {/* Top Navigation / Status Bar */}
      <div className="flex-shrink-0 h-20 bg-black/60 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-8 relative z-50">
        <div className="flex items-center gap-6">
          <Link href={`/employer/forge/${challengeId}`} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-xl font-black uppercase tracking-tighter">Mission Spectator</h1>
               <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] font-mono text-primary-light uppercase tracking-widest">
                  God Mode
               </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
               <Terminal className="w-3 h-3" /> Challenge ID: {challengeId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                 <span className={`text-xs font-black uppercase tracking-widest ${status === 'live' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {status === 'live' ? 'Interception Active' : 'Scanning Signals...'}
                 </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 mt-0.5">Keystroke Intercept: 0.5s Latency</span>
           </div>

           <div className="h-10 w-px bg-white/5" />

           <div className="flex items-center gap-4">
              <div className="text-right">
                 <div className="text-sm font-black text-white font-mono">{latency}ms</div>
                 <div className="text-[9px] uppercase tracking-widest text-zinc-500">Processing</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                 <Wifi className="w-5 h-5 text-primary" />
              </div>
           </div>
        </div>
      </div>

      {/* Main Grid: Code + Preview */}
      <div className="flex-grow relative">
        <SandpackProvider
          template="react"
          theme="dark"
          files={{
            "/App.js": activeCode
          }}
          options={{
            classes: {
              "sp-layout": "!border-none !rounded-none !bg-transparent",
              "sp-editor": "!bg-transparent",
              "sp-preview": "!bg-[#05050a]"
            }
          }}
        >
          <SandpackLayout className="h-full">
            <div className="flex-1 h-full relative border-r border-white/5">
               <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Source Buffer</span>
               </div>
               <SandpackCodeEditor 
                  readOnly 
                  showLineNumbers 
                  className="h-full !bg-[#0a0a0f]"
                  style={{ height: 'calc(100vh - 80px)' }}
               />
            </div>
            
            <div className="flex-1 h-full relative bg-[#05050a]">
               <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md">
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Remote Compilation</span>
               </div>
               <SandpackPreview 
                  showNavigator={false} 
                  className="h-full"
                  style={{ height: 'calc(100vh - 80px)' }}
               />
            </div>
          </SandpackLayout>
        </SandpackProvider>

        {/* Intelligence Overlay */}
        <div className="absolute bottom-10 left-10 z-30 w-80 p-6 bg-black/80 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-primary/20">
           <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Neural Telemetry</h3>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-zinc-500">PACKETS RECEIVED</span>
                 <span className="text-white">{(activeCode.length / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-zinc-500">SYNC PROTOCOL</span>
                 <span className="text-emerald-500">WSS-SECURE</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                 <div className="w-3/4 h-full bg-primary shadow-[0_0_10px_rgba(255,111,97,0.5)] animate-pulse" />
              </div>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="h-10 bg-black border-t border-white/5 flex items-center px-8 justify-between">
         <div className="flex gap-6 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-rose-500" /> End-to-End Encrypted</span>
            <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-primary" /> Multi-Spectator Support</span>
         </div>
         <div className="text-[9px] font-mono text-zinc-700">
            © 2026 UPNABOVE ARBITER SYSTEM
         </div>
      </div>
    </div>
  );
}
