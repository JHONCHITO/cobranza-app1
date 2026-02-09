// app/oficina/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OfficeDashboard } from "@/components/office-dashboard";
import { AuthSession } from "@/lib/types";
import { getCurrentSession, logout } from "@/lib/store";

export default function OficinaPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = getCurrentSession();

      if (!saved || saved.userType !== "admin") {
        router.replace("/");
        return;
      }

      setSession(saved);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary-foreground font-medium">Cargando Oficina...</p>
        </div>
      </div>
    );
  }

  return <OfficeDashboard session={session} onLogout={handleLogout} />;
}
