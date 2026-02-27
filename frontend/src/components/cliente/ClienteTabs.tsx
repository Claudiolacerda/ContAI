"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, TrendingUp, FileText, Calendar, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "",          label: "Visão Geral",  icon: BarChart3 },
  { href: "/financeiro", label: "Financeiro",   icon: TrendingUp },
  { href: "/relatorios", label: "Relatórios",   icon: FileText },
  { href: "/calendario", label: "Calendário",   icon: Calendar },
  { href: "/andamento",  label: "Andamento",    icon: CheckSquare },
];

interface ClienteTabsProps {
  clienteId: string;
}

export function ClienteTabs({ clienteId }: ClienteTabsProps) {
  const pathname = usePathname();
  const basePath = `/cliente/${clienteId}`;

  return (
    <div className="mt-4">
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map(({ href, label, icon: Icon }) => {
            const fullPath = `${basePath}${href}`;
            const isActive = href === ""
              ? pathname === basePath
              : pathname.startsWith(fullPath);

            return (
              <Link
                key={href}
                href={fullPath}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                  isActive
                    ? "border-brand-600 text-brand-700 bg-brand-50/30"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-brand-600" : "text-slate-400"
                )} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
