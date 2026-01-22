"use client";

import { useState } from "react";
import { DashboardNav } from "./dashboard-nav";
import { DashboardHeader } from "./dashboard-header";

export function DashboardLayoutClient({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav
        session={session}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col w-full">
        <DashboardHeader
          session={session}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
