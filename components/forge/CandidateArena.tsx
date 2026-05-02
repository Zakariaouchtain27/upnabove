"use client";

import React, { useState, useEffect } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview, 
  SandpackFileExplorer,
  useSandpack 
} from "@codesandbox/sandpack-react";
import { useLiveBroadcast } from "@/hooks/useLiveBroadcast";
import { Shield, Zap, Terminal, Wifi } from "lucide-react";

/**
 * Internal component to sync Sandpack state with our broadcast hook
 */
function BroadcastSync({ challengeId }: { challengeId: string }) {
  const { sandpack } = useSandpack();
  const activeCode = sandpack.files[sandpack.activeFile]?.code || "";
  
  // Use our custom hook to stream this code to Supabase
  useLiveBroadcast(challengeId, activeCode);
  
  return null;
}

export interface CandidateArenaProps {
  challengeId: string;
  initialCode?: string;
  template?: "react" | "nextjs" | "vite-react";
}

export function CandidateArena({ challengeId, initialCode, template = "react" }: CandidateArenaProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-[#05050a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Arena Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Neural Terminal</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Forge Environment v4.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 group">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Sync Active</span>
           </div>
           
           <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase">
              <Wifi className="w-3 h-3" /> 42ms Latency
           </div>
        </div>
      </div>

      {/* Main Coding Workspace */}
      <div className="flex-grow relative">
        <SandpackProvider
          template={template}
          theme="dark"
          files={{
            "/App.js": initialCode || `export default function App() {\n  return (\n    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#0a0a0f", color: "white", minHeight: "100vh" }}>\n      <h1>Hello Forge</h1>\n      <p>Start coding to prove your skills...</p>\n    </div>\n  );\n}`
          }}
          options={{
            recompileMode: "immediate",
            recompileDelay: 300,
          }}
        >
          <SandpackLayout className="h-full border-none rounded-none !bg-transparent">
            {/* Sync Logic Wrapper */}
            <BroadcastSync challengeId={challengeId} />
            
            <SandpackFileExplorer className="h-full !bg-[#0a0a0f]/80 !border-r !border-white/5 hidden md:block w-48" />
            
            <SandpackCodeEditor 
              showLineNumbers
              showInlineErrors
              showTabs
              closableTabs
              className="h-full flex-grow !bg-transparent text-sm"
              style={{ height: 'calc(100vh - 180px)' }}
            />
            
            <SandpackPreview 
              showNavigator={false}
              showRefreshButton
              className="h-full !bg-[#05050a] flex-grow hidden lg:block"
              style={{ height: 'calc(100vh - 180px)' }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>

      {/* Footer / Status Bar */}
      <div className="px-6 py-3 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" /> Identity Masked</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Turbo Compilation</span>
         </div>
         <div>
            System Healthy: 100%
         </div>
      </div>
    </div>
  );
}
