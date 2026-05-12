import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { Logo } from "@/src/components/Logo";
import { HexIcon } from "@/src/components/HexIcon";
import { FieldInput } from "@/src/components/FieldInput";
import { auth, db } from "@/src/lib/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error-handler";

const features = [
  "Capture Territories",
  "Compete for Leaderboards",
  "Join Guilds",
  "Build a Daily Running Streak",
];

const Signup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/app/map");
    }
  }, [user, authLoading, navigate]);

  const createPlayerProfile = async (uid: string, callsign: string) => {
    const path = `players/${uid}`;
    try {
      await setDoc(doc(db, "players", uid), {
        uid: uid,
        tag: callsign.toUpperCase(),
        factionColor: "#14b8a6",
        totalArea: 0,
        totalSteps: 0,
        healthScore: 0,
        avgPace: "0:00",
        territoriesCaptured: 0,
        lastActive: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createPlayerProfile(result.user.uid, tag);
      navigate("/app/map");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left intro panel */}
      <div className="relative flex-none lg:flex-1 lg:w-1/2 hex-bg flex items-center justify-center px-8 py-16 lg:py-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsla(var(--primary)/0.15),transparent_70%)]" />
        <div className="relative z-10 max-w-md animate-slide-up">
          <Logo size="lg" />
          <h1 className="mt-8 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-glow">
            Join the Conquest
          </h1>
          <p className="mt-3 text-muted-foreground font-tactical uppercase tracking-widest text-sm">
            Explore territories. Claim your land.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((f, i) => (
              <li
                key={f}
                className="flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: "forwards" }}
              >
                <HexIcon size={28} className="text-primary" filled />
                <span className="font-tactical text-base font-semibold uppercase tracking-wide text-foreground">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 lg:w-1/2 bg-card flex items-center justify-center px-6 py-12 lg:py-0 relative">
        <div className="absolute inset-0 hex-bg opacity-30" />
        <form
          onSubmit={submit}
          className="relative w-full max-w-md bg-background/80 backdrop-blur-xl rounded-2xl p-8 sm:p-10 glow-border animate-slide-up"
        >
          <h2 className="font-display text-3xl font-black uppercase tracking-widest text-center text-glow">
            Request Access
          </h2>

          <div className="mt-8 space-y-3">
             <FieldInput 
                type="text" 
                placeholder="CALLSIGN (TAG)" 
                value={tag}
                onChange={e => setTag(e.target.value)}
                required
             />
            <FieldInput 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput 
                type="password" 
                placeholder="Access Key" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <FieldInput type="password" placeholder="Confirm Key" required />
            </div>
          </div>

          {error && <p className="mt-4 text-destructive font-tactical text-[10px] text-center font-bold uppercase tracking-widest">{error}</p>}

          <Button type="submit" variant="hero" size="lg" className="w-full mt-6" disabled={loading}>
            {loading ? "Registering..." : "Initialize Profile"}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground font-tactical uppercase tracking-widest">
            Already Authorized?{" "}
            <Link to="/login" className="text-primary hover:text-primary-glow underline font-bold">
              Input Key Above
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
