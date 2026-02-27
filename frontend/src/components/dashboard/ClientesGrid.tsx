"use client";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Building2, ArrowUpRight } from "lucide-react";

interface Cliente {
  id: string;
  nomeEmpresa: string;
  cnpj: string;
  statusContabil: string;
  faturamentoMensal: number;
  lucroMensal: number;
  indicadorSaude: number;
  pendencias: number;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  EM_DIA:   { label: "Em dia",   dot: "bg-emerald-400", badge: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30" },
  PENDENTE: { label: "Pendente", dot: "bg-amber-400",   badge: "bg-amber-400/20 text-amber-300 border border-amber-400/30" },
  ATRASADO: { label: "Atrasado", dot: "bg-red-400",     badge: "bg-red-400/20 text-red-300 border border-red-400/30" },
  em_dia:   { label: "Em dia",   dot: "bg-emerald-400", badge: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30" },
  pendente: { label: "Pendente", dot: "bg-amber-400",   badge: "bg-amber-400/20 text-amber-300 border border-amber-400/30" },
  atrasado: { label: "Atrasado", dot: "bg-red-400",     badge: "bg-red-400/20 text-red-300 border border-red-400/30" },
};
const FALLBACK = { label: "...", dot: "bg-slate-400", badge: "bg-white/10 text-white/60 border border-white/10" };
const AVATAR_COLORS = ["from-blue-400 to-blue-600","from-violet-400 to-violet-600","from-emerald-400 to-emerald-600","from-amber-400 to-amber-600","from-rose-400 to-rose-600","from-cyan-400 to-cyan-600"];

function HealthBar({ value }: { value: number }) {
  const color = value <= 2 ? "bg-red-400" : value <= 3 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all ${i < value ? color : "bg-white/10"}`} style={{ width: i < value ? "18px" : "14px" }} />
      ))}
    </div>
  );
}

export function ClientesGrid() {
  const [status] = useQueryState("status", { defaultValue: "" });
  const [sort] = useQueryState("sort", { defaultValue: "nome_asc" });
  const { data, isLoading } = useQuery({
    queryKey: ["clientes", status, sort],
    queryFn: () => api.get("/clientes", { params: { status: status || undefined, sort } }).then(r => r.data),
  });
  const clientes: Cliente[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 overflow-hidden animate-pulse" style={{background:"rgba(255,255,255,0.05)"}}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/10 rounded-xl" /><div className="space-y-2 flex-1"><div className="h-4 bg-white/10 rounded w-3/4" /><div className="h-3 bg-white/5 rounded w-1/2" /></div></div>
              <div className="h-6 bg-white/10 rounded-full w-24" />
              <div className="grid grid-cols-2 gap-3"><div className="h-14 bg-white/5 rounded-xl" /><div className="h-14 bg-white/5 rounded-xl" /></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/10" style={{background:"rgba(255,255,255,0.05)"}}>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-white/30" />
        </div>
        <p className="font-semibold text-white/70 text-lg">Nenhum cliente encontrado</p>
        <p className="text-sm text-white/40 mt-1">Tente ajustar os filtros ou adicione um novo cliente</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {clientes.map((cliente, idx) => {
          const cfg = STATUS_CONFIG[cliente.statusContabil] ?? FALLBACK;
          const lucroPositivo = (cliente.lucroMensal ?? 0) >= 0;
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          return (
            <Link key={cliente.id} href={`/cliente/${cliente.id}`} className="group rounded-2xl border border-white/10 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-900/30 transition-all duration-200 overflow-hidden flex flex-col" style={{background:"rgba(255,255,255,0.07)", backdropFilter:"blur(12px)"}}>
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 bg-gradient-to-br ${avatarColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-sm font-bold text-white">{cliente.nomeEmpresa.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate text-sm leading-tight">{cliente.nomeEmpresa}</p>
                      <p className="text-xs text-blue-200/40 mt-0.5 font-mono">{cliente.cnpj}</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-blue-400/20 flex items-center justify-center transition-colors flex-shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-300 transition-colors" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-5">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {cliente.pendencias > 0 && (
                    <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full font-medium">
                      {cliente.pendencias} pendencia{cliente.pendencias > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-blue-200/50 mb-1 font-medium">Faturamento</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(cliente.faturamentoMensal ?? 0)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-blue-200/50 mb-1 font-medium">Lucro</p>
                    <p className={`text-sm font-bold flex items-center gap-1 ${lucroPositivo ? "text-emerald-400" : "text-red-400"}`}>
                      {lucroPositivo ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatCurrency(Math.abs(cliente.lucroMensal ?? 0))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between" style={{background:"rgba(0,0,0,0.1)"}}>
                <span className="text-xs text-blue-200/40 font-medium">Saude financeira</span>
                <HealthBar value={cliente.indicadorSaude ?? 0} />
              </div>
            </Link>
          );
        })}
      </div>
      {data?.pagination?.pages > 1 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2.5 text-sm font-semibold text-blue-300 hover:text-white border border-blue-400/30 hover:border-blue-400/60 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            Carregar mais clientes
          </button>
        </div>
      )}
    </div>
  );
}