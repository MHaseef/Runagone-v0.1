import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/src/components/AppLayout";
import { PageHeader } from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";
import { Swords, Trophy, Target, Shield, Skull } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db } from "@/src/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error-handler";
import { Heap } from "@/src/lib/dsa";

interface PlayerData {
  uid: string;
  tag: string;
  factionColor: string;
  totalArea: number;
  totalSteps: number;
  territoriesCaptured: number;
}

interface RankedPlayer extends PlayerData {
  rank: number;
}

const Leaderboard = () => {
  const [tab, setTab] = useState<"global" | "local">("global");
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, "players");
    const unsub = onSnapshot(q, (snapshot) => {
      const allPlayers: PlayerData[] = [];
      snapshot.forEach(doc => {
        allPlayers.push(doc.data() as PlayerData);
      });

      // Use a Max Heap to sort players by total area (score)
      const maxHeap = new Heap<PlayerData>((a, b) => b.totalArea - a.totalArea);
      for (const p of allPlayers) {
        maxHeap.push(p);
      }

      // Pop from heap to get ranked order
      const ranked: RankedPlayer[] = [];
      let rank = 1;
      while (maxHeap.size() > 0) {
        const p = maxHeap.pop();
        if (p) {
          ranked.push({ ...p, rank: rank++ });
        }
      }

      setPlayers(ranked);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "players");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 pb-24 lg:pb-10 max-w-6xl mx-auto">
        <PageHeader title="Leaderboard" subtitle="Competition Hub" />

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["global", "local"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "h-12 rounded-full font-display font-bold uppercase tracking-widest text-sm transition-all",
                tab === t
                  ? "bg-primary/15 text-primary border-2 border-primary shadow-glow-sm"
                  : "border-2 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {t === "global" ? "GLOBAL" : "LOCAL"}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-10 text-muted-foreground animate-pulse">
               Calculating global rankings via Max-Heap...
             </div>
          ) : players.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center gap-4 bg-muted/5">
              <div className="h-20 w-20 rounded-full bg-muted/10 flex items-center justify-center mb-2">
                <Swords className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h4 className="font-display text-lg font-bold uppercase tracking-widest text-muted-foreground">The Ranks are Empty</h4>
              <p className="text-sm text-muted-foreground/60 max-w-sm mt-1 font-sans leading-relaxed">
                No data available for the current sector. Be the first to claim territory and lead the charge.
              </p>
              <Button variant="hero" className="mt-4 px-8" asChild>
                <Link to="/app/map">Start Conquest</Link>
              </Button>
            </div>
          ) : (
            players.map((p) => (
              <div key={p.uid} className={cn(
                "group relative overflow-hidden rounded-2xl border bg-black/40 backdrop-blur-md p-4 sm:p-5 transition-all hover:bg-black/60",
                p.rank === 1 ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]" : "border-white/10"
              )}>
                {p.rank === 1 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
                )}
                
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-display font-black text-2xl" style={{ color: p.rank === 1 ? '#eab308' : '#6b7280' }}>
                    {p.rank}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: p.factionColor, boxShadow: `0 0 10px ${p.factionColor}` }} />
                        <h3 className="font-display font-bold text-lg text-white truncate">{p.tag}</h3>
                        {p.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total M²</span>
                          <span className="font-mono text-xl text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                            {p.totalArea > 1000 ? (p.totalArea / 1000).toFixed(1) + 'k' : Math.floor(p.totalArea)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
