import React, { useState, useEffect } from "react";
import { AppLayout } from "@/src/components/AppLayout";
import { PageHeader } from "@/src/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Footprints, Map as MapIcon, Trophy, Flame } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error-handler";

const Stats = () => {
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalSteps: 0,
    hexesCaptured: 0,
    streak: 0
  });

  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    // Listen to personal stats
    const unsub = onSnapshot(doc(db, "players", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          totalDistance: (data.totalDistance || 0),
          totalSteps: (data.totalSteps || 0),
          hexesCaptured: (data.territoriesCaptured || 0),
          streak: (data.streak || 0)
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "players (Stats)");
    });

    return () => unsub();
  }, []);

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 pb-24 lg:pb-10 max-w-6xl mx-auto">
        <PageHeader title="My Stats" subtitle="Performance Analytics" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Distance", value: `${stats.totalDistance.toFixed(2)} km`, icon: MapIcon, color: "text-blue-500" },
            { label: "Total Steps", value: `${stats.totalSteps}`, icon: Footprints, color: "text-green-500" },
            { label: "Hexes Captured", value: `${stats.hexesCaptured}`, icon: Trophy, color: "text-yellow-500" },
            { label: "Current Streak", value: `${stats.streak} Days`, icon: Flame, color: "text-orange-500" },
          ].map(stat => (
            <div key={stat.label} className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-md">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
              <div className="text-2xl font-display font-black">{stat.value}</div>
              <div className="text-[10px] font-tactical uppercase tracking-widest text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-muted/5">
          <p className="text-muted-foreground font-tactical uppercase tracking-widest text-sm">Detailed Analytics coming soon</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Stats;
