import React from "react";
import { NavLink } from "react-router-dom";
import { Map as MapIcon, Trophy, User, LogOut, Zap } from "lucide-react";
import { auth } from "../lib/firebase.ts";
import { signOut } from "firebase/auth";

export const Sidebar: React.FC = () => {
  return (
    <div className="w-20 md:w-64 bg-white border-r border-[#e5e7eb] flex flex-col h-screen transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Zap className="text-[#3b82f6] w-6 h-6" />
        </div>
        <h1 className="text-xl font-mono font-black tracking-tighter hidden md:block">RUNAGON</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem to="/map" icon={MapIcon} label="War Map" />
        <NavItem to="/leaderboard" icon={Trophy} label="Rankings" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>

      <div className="p-4 border-t border-[#f0f2f5]">
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 w-full p-3 text-[#ef4444] hover:bg-red-50 rounded-xl transition-colors font-mono text-sm font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block uppercase tracking-wider">Decommission</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center gap-4 p-3 rounded-xl transition-all font-mono text-sm font-bold uppercase tracking-wider
      ${isActive ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-100' : 'text-[#64748b] hover:bg-[#f8fafc]'}
    `}
  >
    <Icon className="w-5 h-5 shrink-0" />
    <span className="hidden md:block">{label}</span>
  </NavLink>
);
