import React from "react";
import { AppLayout } from "@/src/components/AppLayout";
import { PageHeader } from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";
import { User, Bell, Shield, Smartphone } from "lucide-react";

const Settings = () => {
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 pb-24 lg:pb-10 max-w-4xl mx-auto">
        <PageHeader title="Settings" subtitle="System Configuration" />

        <div className="space-y-6">
          {[
            { title: "Profile", desc: "Manage your operative identity", icon: User },
            { title: "Notifications", desc: "Configure sector alerts", icon: Bell },
            { title: "Privacy & Security", desc: "Data encryption and access", icon: Shield },
            { title: "App Preferences", desc: "UI and haptic feedback", icon: Smartphone },
          ].map(item => (
            <div key={item.title} className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-md flex items-center justify-between group hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-widest">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="font-tactical uppercase tracking-widest text-[10px]">Edit</Button>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground font-tactical uppercase tracking-widest">
          <span>Version 1.0.4-TACTICAL</span>
          <Button variant="destructive" size="sm" className="h-8 px-4 rounded-lg">Reset Local Data</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
