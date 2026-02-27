"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { CheckCircle2, Clock, AlertTriangle, Calendar, FileCheck, Plus, X, Loader2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface Obrigacao {
  id: string;
  tipo: string;
  descricao: string;
  dataVencimento: string;
  valor?: number;
  status: string;
  guiaGerada: boolean;
}

interface PageProps { params: { id: string }; }

function getDaysLabel(dateStr: string) {
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days < 0) return { label: `${Math.abs(days)}d atrasado`, color: "text-red-400" };
  if (days === 0) return { label: "Vence hoje", color: "text-orange-400" };
  if (days <= 3) return { label: `${days}d`, color: "text-orange-400" };
  if (days <= 7) return { label: `${days}d`, color: "text-amber-400" };
  return { label: `${days}d`, color: "text-blue-300/60" };
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; classes: string }> = {
  PENDENTE:   { label: "Pendente",   icon: Clock,         classes: "bg-amber-400/20 border-amber-400/30 text-amber-300" },
  PAGO:       { label: "Pago",       icon: CheckCircle2,  classes: "bg-emerald-400/20 border-emerald-400/30 text-emerald-300" },
  ATRASADO:   { label: "Atrasado",   icon: AlertTriangle, classes: "bg-red-400/20 border-red-400/30 text-red-300" },
  DISPENSADO: { label: "Dispensado", icon: FileCheck,     classes: "bg-white/10 border-white/20 text-white/50" },
};
const FALLBACK_CFG = { label: "Pendente", icon: Clock, classes: "bg-amber-400/20 border-amber-400/30 text-amber-300" };

function NovaObrigacaoModal({ clienteId, onClose }: { clienteId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ tipo: "", descricao: "", dataVencimento: "", valor: "", status: "PENDENTE" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputClass = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const submit = async () => {
    if (!form.tipo || !form.descricao || !form.dataVencimento) { toast.error("Preencha os campos obrigatorios"); return; }
    setLoading(true);
    try {
      await api.post(`/clientes/${clienteId}/obrigacoes`, { ...form, valor: form.valor ? Number(form.valor) : undefined });
      toast.success("Obrigacao cadastrada!");
      qc.invalidateQueries({ queryKey: ["cliente-obrigacoes", clienteId] });
      onClose();
    } catch { toast.error("Erro ao cadastrar"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)"}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Nova Obrigacao Fiscal</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tipo *</label>
              <input value={form.tipo} onChange={e => set("tipo", e.target.value)} placeholder="Ex: DARF, INSS" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Vencimento *</label>
              <input type="date" value={form.dataVencimento} onChange={e => set("dataVencimento", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Descricao *</label>
            <input value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Ex: DARF Simples Nacional competencia Fevereiro" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Valor</label>
              <input type="number" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="0,00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass}>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="ATRASADO">Atrasado</option>
                <option value="DISPENSADO">Dispensado</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClienteCalendarioPage({ params }: PageProps) {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: obrigacoes = [], isLoading } = useQuery<Obrigacao[]>({
    queryKey: ["cliente-obrigacoes", params.id],
    queryFn: () => api.get(`/clientes/${params.id}/obrigacoes`).then(r => r.data),
  });

  const marcarPago = useMutation({
    mutationFn: (id: string) => api.patch(`/obrigacoes/${id}`, { status: "PAGO" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cliente-obrigacoes", params.id] }); toast.success("Marcado como pago!"); },
  });

  if (isLoading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{background:"rgba(255,255,255,0.07)"}} />)}</div>;

  const pendentes = obrigacoes.filter(o => o.status === "PENDENTE" || o.status === "ATRASADO");
  const concluidas = obrigacoes.filter(o => o.status === "PAGO" || o.status === "DISPENSADO");

  return (
    <div className="space-y-6 animate-slide-up">
      {showModal && <NovaObrigacaoModal clienteId={params.id} onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
          {[
            { label: "Total", value: obrigacoes.length, color: "text-blue-300" },
            { label: "Pendentes", value: obrigacoes.filter(o => o.status === "PENDENTE").length, color: "text-amber-300" },
            { label: "Atrasadas", value: obrigacoes.filter(o => o.status === "ATRASADO").length, color: "text-red-400" },
            { label: "Pagas", value: obrigacoes.filter(o => o.status === "PAGO").length, color: "text-emerald-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 border border-white/10 text-center" style={{background:"rgba(255,255,255,0.07)"}}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-blue-200/50 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex-shrink-0">
          <Plus className="w-4 h-4" />
          Nova Obrigacao
        </button>
      </div>

      {pendentes.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{background:"rgba(255,255,255,0.07)"}}>
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-300" />
            <h3 className="font-semibold text-white">Obrigacoes Pendentes</h3>
          </div>
          <div className="divide-y divide-white/5">
            {pendentes.map((ob) => {
              const daysInfo = getDaysLabel(ob.dataVencimento);
              const cfg = STATUS_CONFIG[ob.status] ?? FALLBACK_CFG;
              const Icon = cfg.icon;
              return (
                <div key={ob.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${cfg.classes}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{ob.tipo}</p>
                      <p className="text-xs text-blue-200/50">{ob.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-blue-200/70">{formatDate(ob.dataVencimento)}</p>
                      <p className={`text-xs font-semibold ${daysInfo.color}`}>{daysInfo.label}</p>
                    </div>
                    {ob.status === "PENDENTE" && (
                      <button onClick={() => marcarPago.mutate(ob.id)} disabled={marcarPago.isPending}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                        Marcar Pago
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {concluidas.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden opacity-70" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white">Pagas / Dispensadas</h3>
          </div>
          <div className="divide-y divide-white/5">
            {concluidas.map((ob) => {
              const cfg = STATUS_CONFIG[ob.status] ?? FALLBACK_CFG;
              const Icon = cfg.icon;
              return (
                <div key={ob.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${cfg.classes}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 line-through">{ob.tipo}</p>
                      <p className="text-xs text-blue-200/30">{formatDate(ob.dataVencimento)}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.classes}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {obrigacoes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-white/10" style={{background:"rgba(255,255,255,0.05)"}}>
          <Calendar className="w-12 h-12 text-white/20 mb-3" />
          <p className="text-white/50 font-medium">Nenhuma obrigacao cadastrada</p>
          <p className="text-white/30 text-sm mt-1">Clique em Nova Obrigacao para comecar</p>
        </div>
      )}
    </div>
  );
}