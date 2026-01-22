"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Image from "next/image"
import LogoLotusBranco from "../../../../public/lotus-white-image.webp"
import {
  LayoutDashboard,
  Medal,
  Users,
  Dumbbell,
  CreditCard,
  Award,
  UserCircle,
  X,
  FileText,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Painel Principal",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Alunos",
    href: "/dashboard/alunos",
    icon: Users,
  },
  {
    title: "Professores",
    href: "/dashboard/professores",
    icon: UserCircle,
  },
  {
    title: "Modalidades",
    href: "/dashboard/modalidades",
    icon: Dumbbell,
  },
  {
    title: "Mensalidades",
    href: "/dashboard/mensalidades",
    icon: CreditCard,
  },
  {
    title: "Graduações",
    href: "/dashboard/graduacoes",
    icon: Award,
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: FileText,
  },
];

export function DashboardNav({ session, isOpen, onClose }: { session: any; isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  // Fechar menu ao mudar de rota no mobile
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  const NavContent = (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between gap-2">
            <Image src={LogoLotusBranco} width={150} height={150} alt="Logo Lotus" className="mx-auto mb-4" />
          <div className="flex items-center gap-2">
            {/* <Medal className="h-8 w-8" /> */}
            {/* <div>
              <h1 className="text-xl font-bold">Dojo Manager</h1>
              <p className="text-xs text-zinc-200">Sistema de Gestão</p>
            </div> */}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-zinc-700 rounded-lg transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-100 hover:bg-zinc-700/50 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-500">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-500 flex items-center justify-center">
            <span className="text-sm font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || "Administrador"}
            </p>
            <p className="text-xs text-zinc-200 truncate">
              {isAdmin ? "Administrador" : "Professor"}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Versão Desktop - Menu lateral fixo */}
      <aside className="hidden lg:flex w-64 bg-zinc-600 text-white flex-col">
        {NavContent}
      </aside>

      {/* Versão Mobile - Menu flutuante com overlay */}
      {isOpen && (
        <>
          {/* Overlay escuro com animação */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Menu lateral flutuante com animação */}
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-zinc-600 text-white flex flex-col z-50 shadow-xl animate-in slide-in-from-left duration-300">
            {NavContent}
          </aside>
        </>
      )}
    </>
  );
}
