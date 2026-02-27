"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Calendar, FileText, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const NAV_ITEMS = [
  { href: "/dashboard",  icon: BarChart3, label: "Dashboard" },
  { href: "/clientes",   icon: Users,     label: "Clientes" },
  { href: "/calendario", icon: Calendar,  label: "Calendario" },
  { href: "/relatorios", icon: FileText,  label: "Relatorios" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-white/10" style={{background: "rgba(15, 30, 55, 0.6)", backdropFilter: "blur(20px)"}}>
      <div className="px-5 h-16 flex items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">ContAI</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group", active ? "bg-blue-500/20 text-white border border-blue-400/30" : "text-blue-200/70 hover:bg-white/5 hover:text-white")}>
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-blue-300" : "text-blue-300/50 group-hover:text-blue-200")} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-300/60" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        <Link href="/configuracoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200/70 hover:bg-white/5 hover:text-white transition-all group">
          <Settings className="w-4 h-4 text-blue-300/50 group-hover:text-blue-200" />
          Configuracoes
        </Link>
        <div className="mt-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-200">{user?.nome?.charAt(0).toUpperCase() ?? "C"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.nome ?? "Contador"}</p>
            <p className="text-xs text-blue-200/50 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} title="Sair" className="text-blue-200/40 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}