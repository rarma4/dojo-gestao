"use client";

import { ButtonSignOut } from "./button-signout";
import { Bell, Menu } from "lucide-react";

export function DashboardHeader({ session, onMenuClick }: { session: any; onMenuClick?: () => void }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botão hamburguer para mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bem-vindo, {session?.user?.name?.split(" ")[0] || "Professor"}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Gerencie sua academia com facilidade
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            {/* <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>
          <ButtonSignOut />
        </div>
      </div>
    </header>
  );
}
