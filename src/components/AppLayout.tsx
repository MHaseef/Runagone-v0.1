import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Trophy, Settings, Map, LogOut, Menu, X, Bug } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { auth } from "@/src/lib/firebase";
import { signOut } from "firebase/auth";

const nav = [
  { to: "/app/test", label: "Test Chamber", icon: Bug },
  { to: "/app/map", label: "War Map", icon: Map },
  { to: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/app/stats", label: "My Stats", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <div className="min-h-screen bg-background hex-bg flex overflow-x-hidden">
      {/* Mobile Top Branding Bar (No menu button anymore) */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6">
        <Logo size="sm" to="/app/map" />
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">OP</div>
        </div>
      </header>

      {/* Sidebar - Desktop Exclusive */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border z-30">
        <div className="h-20 flex items-center px-8">
          <Logo size="md" to="/app/map" />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {nav.map(item => (
            <SidebarLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-tactical font-bold uppercase tracking-widest text-xs">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative pt-14 lg:pt-0">
        <div key={location.pathname} className={cn(
          "flex-1 animate-fade-in mx-auto w-full",
          location.pathname === "/app/map" 
            ? "max-w-none p-0" 
            : "px-4 md:px-8 py-6 lg:py-10 pb-32 lg:pb-12 max-w-7xl"
        )}>
          {children}
        </div>

        {location.pathname !== "/app/map" && (
        <footer className="hidden md:block py-8 px-8 border-t border-white/5 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-muted-foreground font-tactical uppercase tracking-widest">
                © 2026 RUNAGON · TACTICAL CONQUEST SYSTEMS
              </p>
              <p className="text-[10px] text-muted-foreground/40 font-mono">
                SECURE UPLINK ACTIVE · ENCRYPTION LEVEL 9
              </p>
            </div>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              BUILD 1.0.4-STABLE
            </p>
          </div>
        </footer>
        )}

        {/* Mobile Bottom Navigation - Mobile Only */}
        <MobileBottomNav />
      </main>
    </div>
  );
};

const SidebarLink = ({ to, label, icon: Icon, onClick }: any) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-base relative group",
        isActive
          ? "bg-sidebar-accent text-primary shadow-glow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      )
    }
  >
    {({ isActive }) => (
      <>
        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 bg-primary rounded-r-full shadow-glow-sm" />}
        <Icon className={cn("h-5 w-5 transition-base", isActive && "drop-shadow-[0_0_6px_hsla(var(--primary))]")} />
        <span className="font-tactical font-semibold uppercase tracking-wider text-sm">{label}</span>
      </>
    )}
  </NavLink>
);

const mobileItems = [
  { to: "/app/test", label: "Test", icon: Bug },
  { to: "/app/map", label: "Map", icon: Map },
  { to: "/app/leaderboard", label: "Rank", icon: Trophy },
  { to: "/app/stats", label: "Intel", icon: BarChart3 },
  { to: "/app/settings", label: "Set", icon: Settings },
];

const MobileBottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-sidebar/95 backdrop-blur border-t border-sidebar-border h-16 flex items-center justify-around px-2 safe-area-inset-bottom">
    {mobileItems.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-base flex-1",
            isActive ? "text-primary" : "text-sidebar-foreground/70"
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_hsla(var(--primary))]")} />
            <span className="text-[10px] font-tactical font-semibold uppercase tracking-wider">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);
