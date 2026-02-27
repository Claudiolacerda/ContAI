"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/formatters";
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DashboardStatsData {
  totalClientes: number;
  faturamentoTotal: number;
  clientesPendentes: number;
  clientesEmDia: number;
}

export function DashboardStats() {
  const { data, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/contador/stats").then(r => r.data),
  });
  const stats = [
    { label: "Total de Clientes", value: data?.totalClientes ?? 0, format: "number" as const, icon: Users, accent: "from-blue-400 to-blue-500", iconBg: "bg-blue-400/20", iconColor: "text-blue-200" },
    { label: "Faturamento Consolidado", value: data?.faturamentoTotal ?? 0, format: "currency" as const, icon: TrendingUp, accent: "from-emerald-400 to-emerald-500", iconBg: "bg-emerald-400/20", iconColor: "text-emerald-200" },
    { label: "Clientes Pendentes", value: data?.clientesPendentes ?? 0, format: "number" as const, icon: AlertTriangle, accent: "from-amber-400 to-amber-500", iconBg: "bg-amber-400/20", iconColor: "text-amber-200" },
    { label: "Clientes em Dia", value: data?.clientesEmDia ?? 0, format: "number" as const, icon: CheckCircle2, accent: "from-teal-400 to-teal-500", iconBg: "bg-teal-400/20", iconColor: "text-teal-200" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, format, icon: Icon, accent, iconBg, iconColor }) => (
        <div key={label} className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 group" style={{background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)"}}>
          <div className={`h-0.5 w-full bg-gradient-to-r ${accent}`} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200/60">{label}</p>
              <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-28 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">
                  {format === "currency" ? formatCurrency(value) : value.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-blue-200/40 mt-1">mes atual</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}