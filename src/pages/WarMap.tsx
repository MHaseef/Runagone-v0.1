import React, { useState } from "react";
import { AppLayout } from "@/src/components/AppLayout";
import { LeafletMap } from "@/src/components/LeafletMap";
import { Button } from "@/src/components/ui/button";
import { Bell, Layers, Locate, Type, Footprints, Play, Pause, Square, Info, Smile } from "lucide-react";
import { HexIcon } from "@/src/components/HexIcon";
import { cn } from "@/src/lib/utils";

const WarMap = () => {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [centerTrigger, setCenterTrigger] = useState(0);

  return (
    <AppLayout>
      <div className="relative h-[calc(100vh-3.5rem)] lg:h-screen">
        {/* Map fills */}
        <LeafletMap className="absolute inset-0" centerTrigger={centerTrigger} />

        {/* Top overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-3 w-full max-w-md px-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-primary/30 shadow-md flex-1">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-primary">
                <Smile className="h-5 w-5 text-black" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-tactical font-bold text-sm uppercase tracking-wider truncate">Operative</div>
              <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                <div className="h-full w-[0%] bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Live metrics overlay */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[2000] grid grid-cols-4 gap-2 w-full max-w-2xl px-3">
          {[
            { l: "Total Area", v: "0.0" },
            { l: "Steps", v: "0", i: <Footprints className="h-3 w-3" /> },
            { l: "Km", v: "0.00" },
            { l: "Hexes", v: "0" },
          ].map(m => (
            <div key={m.l} className="px-2 py-1.5 rounded-lg bg-background/80 backdrop-blur border border-primary/20 text-center">
              <div className="text-[9px] font-tactical uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                {m.i}{m.l}
              </div>
              <div className="font-display text-sm font-bold text-foreground">{m.v}</div>
            </div>
          ))}
        </div>

        {/* Right floating tools - Only Center Button remains */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[2000] flex flex-col gap-3">
          <button
            onClick={() => setCenterTrigger(prev => prev + 1)}
            aria-label="Center on location"
            className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all shadow-glow-sm active:scale-95"
          >
            <Locate className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-20 lg:bottom-16 inset-x-3 z-[2000] flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 w-full max-w-md">
            {!running ? (
              <button
                className="flex-1 flex items-center justify-center gap-3 rounded-full h-16 text-lg font-bold text-white bg-black/60 border border-white/20 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-black/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => { setRunning(true); setPaused(false); }}
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Play className="h-4 w-4 fill-black text-black ml-0.5" />
                </div>
                START CONQUEST
              </button>
            ) : (
              <>
                <button
                  className="flex-1 flex items-center justify-center gap-3 rounded-full h-16 text-lg font-bold text-white bg-black/60 border border-white/20 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-black/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setPaused(p => !p)}
                >
                  <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    {paused ? <Play className="h-4 w-4 fill-black text-black ml-0.5" /> : <Pause className="h-4 w-4 fill-black text-black" />}
                  </div>
                  {paused ? "RESUME" : "PAUSE"}
                </button>
                <button
                  className="h-16 w-16 flex items-center justify-center shrink-0 rounded-full text-white bg-red-500/80 border border-red-500/50 backdrop-blur-md shadow-[0_4px_30px_rgba(239,68,68,0.2)] hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => { setRunning(false); setPaused(false); }}
                  aria-label="Stop"
                >
                  <Square className="h-6 w-6 fill-current" />
                </button>
              </>
            )}
          </div>
          {running && (
            <div className={cn(
              "px-4 py-2 rounded-full bg-background/80 backdrop-blur border border-primary/30 flex items-center gap-3 text-xs font-tactical uppercase tracking-widest",
              paused ? "text-yellow-500" : "text-primary"
            )}>
              <span className={cn("h-2 w-2 rounded-full", paused ? "bg-yellow-500" : "bg-primary animate-pulse-glow")} />
              {paused ? "Paused" : "Active Session"}
              <HexIcon size={14} className="text-primary" filled />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WarMap;
