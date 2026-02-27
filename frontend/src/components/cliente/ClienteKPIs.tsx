"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Minus, DollarSign, PieChart, CreditCard } from "lucide-react";

interface ClienteKPIsProps {
  clienteId: string;
}

export function ClienteKPIs({ clienteId }: ClienteKPIsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["cliente-kpis", clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}/resumo`).then(r => r.data),
  });

  const kpis = [
    {
      label: "Faturamento Mensal",
      value: data?.faturamentoMensal ?? 0,
      prevValue: data?.faturamentoMesAnterior ?? 0,
      format: "currency" as const,
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "Lucro Líquido",
      value: data?.lucroMensal ?? 0,
      prevValue: data?.lucroMesAnterior ?? 0,
      format: "currency" as const,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "Despesas",
      value: data?.despesasMensais ?? 0,
      prevValue: data?.despesasMesAnterior ?? 0,
      format: "currency" as const,
      icon: CreditCard,
      color: "red",
    },
    {
      label: "Margem de Lucro",
      value: data?.margemLucro ?? 0,
      format: "percent" as const,
      icon: PieChart,
      color: data?.margemLucro >= 20 ? "emerald" : data?.margemLucro >= 10 ? "amber" : "red",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-card animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-3 bg-slate-100 rounded w-28" />
              <div className="w-9 h-9 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-7 bg-slate-100 rounded w-36 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(({ label, value, prevValue, format, icon: Icon, color }) => {
        const change = prevValue != null ? ((value - prevValue) / Math.abs(prevValue || 1)) * 100 : null;
        const isPositive = change != null && change > 0;
        const isNeutral = change == null || Math.abs(change) < 0.5;

        const colorMap = {
          blue:    { bg: "bg-blue-50",    icon: "text-blue-600",   text: "text-blue-700" },
          emerald: { bg: "bg-emerald-50", icon: "text-emerald-600",text: "text-emerald-700" },
          red:     { bg: "bg-red-50",     icon: "text-red-600",    text: "text-red-700" },
          amber:   { bg: "bg-amber-50",   icon: "text-amber-600",  text: "text-amber-700" },
        };
        const c = colorMap[color as keyof typeof colorMap] ?? colorMap.blue;

        return (
          <div key={label} className="bg-white rounded-xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-slate-500 leading-tight">{label}</p>
              <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${c.icon}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${c.text} mb-1`}>
              {format === "currency" ? formatCurrency(value) : formatPercent(value)}
            </p>
            {change !== null && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                isNeutral ? "text-slate-400" : isPositive ? "text-emerald-600" : "text-red-500"
              }`}>
                {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isNeutral ? "Estável" : `${isPositive ? "+" : ""}${change.toFixed(1)}%`}
                <span className="text-slate-400 font-normal ml-0.5">vs mês anterior</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
