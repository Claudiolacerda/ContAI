"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/formatters";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export function ClienteProximosVencimentos({ clienteId }: { clienteId: string }) {
  const { data: obrigacoes = [], isLoading } = useQuery({
    queryKey: ["cliente-proximos-vencimentos", clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}/obrigacoes?status=pendente&limit=3`).then(r => r.data),
  });

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-brand-500" />
        Próximos Vencimentos
      </h3>
      {isLoading ? (
        <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />)}</div>
      ) : obrigacoes.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4" />
          Sem vencimentos pendentes
        </div>
      ) : (
        <div className="space-y-2">
          {obrigacoes.map((ob: { id: string; tipo: string; dataVencimento: string }) => {
            const days = differenceInDays(parseISO(ob.dataVencimento), new Date());
            const isUrgent = days <= 3;
            const isLate = days < 0;
            return (
              <div key={ob.id} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                isLate ? "bg-red-50" : isUrgent ? "bg-amber-50" : "bg-slate-50"
              }`}>
                <div>
                  <p className={`text-sm font-medium ${isLate ? "text-red-700" : isUrgent ? "text-amber-700" : "text-slate-700"}`}>
                    {ob.tipo}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(ob.dataVencimento)}</p>
                </div>
                <span className={`text-xs font-bold ${isLate ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-500"}`}>
                  {isLate ? `${Math.abs(days)}d atr.` : days === 0 ? "Hoje" : `${days}d`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ClientePendencias({ clienteId }: { clienteId: string }) {
  const { data: tarefas = [], isLoading } = useQuery({
    queryKey: ["cliente-pendencias", clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}/tarefas?status=backlog,em_andamento&limit=3`).then(r => r.data),
  });

  const PRIO_COLORS: Record<string, string> = {
    urgente: "text-red-600 bg-red-50",
    alta:    "text-orange-600 bg-orange-50",
    media:   "text-amber-600 bg-amber-50",
    baixa:   "text-slate-600 bg-slate-100",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        Pendências
      </h3>
      {isLoading ? (
        <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />)}</div>
      ) : tarefas.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4" />
          Sem pendências abertas
        </div>
      ) : (
        <div className="space-y-2">
          {tarefas.map((t: { id: string; titulo: string; prioridade: string }) => (
            <div key={t.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-sm text-slate-700 font-medium truncate pr-2">{t.titulo}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${PRIO_COLORS[t.prioridade] ?? PRIO_COLORS.baixa}`}>
                {t.prioridade.charAt(0).toUpperCase() + t.prioridade.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
