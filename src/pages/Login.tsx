import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, Chrome, Ghost } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Logo } from "@/src/components/Logo";
import { HexIcon } from "@/src/components/HexIcon";
import { FieldInput } from "@/src/components/FieldInput";
import { auth, db } from "@/src/lib/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error-handler";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/app/map");
    }
  }, [user, authLoading, navigate]);

  const createPlayerProfile = async (uid: string, displayName?: string | null) => {
    const path = `players/${uid}`;
    try {
      await setDoc(doc(db, "players", uid), {
        uid: uid,
        tag: displayName?.toUpperCase() || `GHOST_${uid.substring(0, 5)}`,
        factionColor: "#14b8a6", // Tactical teal/green
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

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createPlayerProfile(result.user.uid, result.user.displayName);
      navigate("/app/map");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      await createPlayerProfile(result.user.uid, "GHOST_OPERATOR");
      navigate("/app/map");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app/map");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left brand panel */}
      <div className="relative flex-none lg:flex-1 lg:w-1/2 bg-sidebar hex-bg flex items-center justify-center px-8 py-10 md:py-12 lg:py-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsla(var(--primary)/0.15),transparent_70%)]" />
        <div className="absolute top-10 left-10 opacity-20 animate-rotate-slow">
          <HexIcon size={120} className="text-primary" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20 animate-float">
          <HexIcon size={80} className="text-primary" filled />
        </div>

        <div className="relative z-10 text-center max-w-md animate-slide-up">
          <Logo size="lg" />
          <h1 className="mt-6 md:mt-8 font-display text-2xl sm:text-4xl font-black uppercase tracking-wider text-glow">
            Welcome Back
          </h1>
          <p className="mt-2 text-muted-foreground font-tactical uppercase tracking-widest text-[10px] sm:text-sm">
            Login to access your territory stats
          </p>
          <p className="mt-1 text-primary/90 font-tactical uppercase tracking-widest text-[10px] sm:text-xs">
            Continue your running streak
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 lg:w-1/2 bg-card flex items-center justify-center px-6 py-8 md:py-10 lg:py-0 relative">
        <div className="absolute inset-0 hex-bg opacity-30" />
        <form
          onSubmit={submit}
          className="relative w-full max-w-md bg-background/80 backdrop-blur-xl rounded-2xl p-8 sm:p-10 glow-border animate-slide-up"
        >
          <h2 className="font-display text-3xl font-black uppercase tracking-widest text-center text-glow">
            Login
          </h2>
          <p className="mt-2 text-center text-muted-foreground font-tactical uppercase tracking-wider text-sm">
            Authorized Entry Only
          </p>

          <div className="mt-8 space-y-4">
            <FieldInput
              icon={<User className="h-4 w-4" />}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <FieldInput
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="Access Key"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="mt-4 text-destructive font-tactical text-[10px] text-center font-bold uppercase tracking-widest">{error}</p>}

          <Button type="submit" variant="hero" size="lg" className="w-full mt-6" disabled={loading}>
            {loading ? "Authenticating..." : "Authenticate"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-background/80 backdrop-blur-xl text-muted-foreground font-tactical font-bold uppercase tracking-widest">or</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="tactical"
              onClick={handleGoogle}
              disabled={loading}
              className="h-11"
            >
              <Chrome className="h-4 w-4" /> Google
            </Button>
            <Button
              type="button"
              variant="tactical"
              onClick={handleAnonymous}
              disabled={loading}
              className="h-11"
            >
              <Ghost className="h-4 w-4" /> Ghost
            </Button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1 text-xs">
            <Link to="#" className="text-primary hover:text-primary-glow underline-offset-2 hover:underline transition-colors font-medium">
              Forgot Password?
            </Link>
            <p className="text-muted-foreground">
              New Operator?{" "}
              <Link to="/signup" className="text-primary hover:text-primary-glow underline font-bold">
                Request Access
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
