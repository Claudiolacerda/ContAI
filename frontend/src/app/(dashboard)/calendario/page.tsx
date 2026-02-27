"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api-client";

const MESES = ["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
const STATUS_ICON: Record<string, any> = { PENDENTE: Clock, ATRASADO: AlertCircle, PAGO: CheckCircle2 };
const STATUS_COLOR: Record<string, string> = {
  PENDENTE: "text-amber-300 bg-amber-400/20 border-amber-400/30",
  ATRASADO: "text-red-300 bg-red-400/20 border-red-400/30",
  PAGO: "text-emerald-300 bg-emerald-400/20 border-emerald-400/30",
  DISPENSADO: "text-blue-300 bg-blue-400/20 border-blue-400/30",
};

interface Obrigacao {
  id: string;
  tipo: string;
  descricao: string;
  dataVencimento: string;
  status: string;
  valor?: number;
  cliente: { nomeEmpresa: string };
}

export default function CalendarioPage() {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [ano, setAno] = useState(today.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(today.getDate());
  const mesStr = `${ano}-${String(mes + 1).padStart(2, "0")}`;

  const { data: obrigacoes = [] } = useQuery<Obrigacao[]>({
    queryKey: ["obrigacoes-mes", mesStr],
    queryFn: () => api.get(`/obrigacoes?mes=${mesStr}`).then(r => r.data),
  });

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const cells = [...Array(primeiroDia).fill(null), ...Array.from({ length: diasNoMes }, (_, i) => i + 1)];

  const prev = () => { if (mes === 0) { setMes(11); setAno(a => a - 1); } else setMes(m => m - 1); };
  const next = () => { if (mes === 11) { setMes(0); setAno(a => a + 1); } else setMes(m => m + 1); };

  const obrigacoesPorDia = (dia: number) => obrigacoes.filter(o => new Date(o.dataVencimento).getDate() === dia);
  const obrigacoesDia = diaSelecionado ? obrigacoesPorDia(diaSelecionado) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Calendario Fiscal</h1>
        <p className="text-blue-200/50 text-sm mt-0.5">Acompanhe obrigacoes e prazos fiscais dos seus clientes</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 overflow-hidden" style={{background:"rgba(255,255,255,0.07)", backdropFilter:"blur(12px)"}}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-blue-200/60 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-white font-semibold">{MESES[mes]} {ano}</h2>
            <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-blue-200/60 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-blue-200/40 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((dia, i) => {
                if (!dia) return <div key={i} />;
                const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear();
                const isSelected = dia === diaSelecionado;
                const obs = obrigacoesPorDia(dia);
                const temAtrasado = obs.some(o => o.status === "ATRASADO");
                const temPendente = obs.some(o => o.status === "PENDENTE");
                const dotColor = temAtrasado ? "bg-red-400" : temPendente ? "bg-amber-400" : obs.length > 0 ? "bg-emerald-400" : null;
                return (
                  <button key={i} onClick={() => setDiaSelecionado(dia === diaSelecionado ? null : dia)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${isSelected ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : isToday ? "bg-blue-500/20 text-blue-300 border border-blue-400/40" : "text-blue-100/70 hover:bg-white/10 hover:text-white"}`}>
                    {dia}
                    {dotColor && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 overflow-hidden flex flex-col" style={{background:"rgba(255,255,255,0.07)", backdropFilter:"blur(12px)"}}>
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">{diaSelecionado ? `${diaSelecionado} de ${MESES[mes]}` : "Selecione um dia"}</h3>
            <p className="text-blue-200/40 text-xs mt-0.5">{obrigacoesDia.length} obrigacao{obrigacoesDia.length !== 1 ? "es" : ""}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!diaSelecionado ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-blue-200/30 text-sm">Clique em um dia para ver as obrigacoes</p>
              </div>
            ) : obrigacoesDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/30 mb-2" />
                <p className="text-blue-200/30 text-sm">Nenhuma obrigacao neste dia</p>
              </div>
            ) : (
              obrigacoesDia.map(o => {
                const Icon = STATUS_ICON[o.status] ?? Clock;
                const colorClass = STATUS_COLOR[o.status] ?? STATUS_COLOR.PENDENTE;
                return (
                  <div key={o.id} className={`p-3 rounded-xl border ${colorClass} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wide">{o.tipo}</span>
                    </div>
                    <p className="text-xs opacity-80">{o.descricao}</p>
                    <p className="text-xs opacity-60 font-medium">{o.cliente.nomeEmpresa}</p>
                    {o.valor && <p className="text-xs font-bold">R$ {Number(o.valor).toFixed(2)}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}