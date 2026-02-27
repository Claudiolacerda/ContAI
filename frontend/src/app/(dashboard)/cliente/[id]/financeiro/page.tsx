"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { FinanceiroTable } from "@/components/cliente/FinanceiroTable";
import { DespesasChart } from "@/components/cliente/DespesasChart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PageProps { params: { id: string }; }

function NovoLancamentoModal({ clienteId, onClose }: { clienteId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: "RECEITA",
    categoria: "",
    descricao: "",
    valor: "",
    dataCompetencia: new Date().toISOString().split("T")[0],
    status: "PAGO",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.categoria || !form.descricao || !form.valor) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/clientes/${clienteId}/lancamentos`, {
        ...form,
        valor: Number(form.valor),
      });
      toast.success("Lancamento cadastrado!");
      qc.invalidateQueries({ queryKey: ["cliente-financeiro", clienteId] });
      qc.invalidateQueries({ queryKey: ["lancamentos", clienteId] });
      qc.invalidateQueries({ queryKey: ["cliente-kpis", clienteId] });
      onClose();
    } catch {
      toast.error("Erro ao cadastrar lancamento");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)"}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Novo Lancamento</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {["RECEITA","DESPESA"].map(t => (
              <button key={t} onClick={() => set("tipo", t)}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.tipo === t ? t === "RECEITA" ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-red-50 border-red-400 text-red-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                {t === "RECEITA" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Descricao *</label>
            <input value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Ex: Honorarios contabeis" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Categoria *</label>
              <input value={form.categoria} onChange={e => set("categoria", e.target.value)} placeholder="Ex: Servicos" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Valor *</label>
              <input type="number" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="0,00" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Data</label>
              <input type="date" value={form.dataCompetencia} onChange={e => set("dataCompetencia", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass}>
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="VENCIDO">Vencido</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClienteFinanceiroPage({ params }: PageProps) {
  const [periodo, setPeriodo] = useState<"3m" | "6m" | "12m">("6m");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cliente-financeiro", params.id, periodo],
    queryFn: () => api.get(`/clientes/${params.id}/financeiro?periodo=${periodo}`).then(r => r.data),
  });

  const totais = data?.totais ?? { faturamento: 0, despesas: 0, lucro: 0 };

  return (
    <div className="space-y-6 animate-slide-up">
      {showModal && <NovoLancamentoModal clienteId={params.id} onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["3m", "6m", "12m"] as const).map((p) => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${periodo === p ? "bg-blue-600 text-white shadow-sm" : "bg-white/10 text-blue-200 border border-white/20 hover:border-blue-400/40 hover:text-white"}`}>
              {p === "3m" ? "3 meses" : p === "6m" ? "6 meses" : "12 meses"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30">
          <Plus className="w-4 h-4" />
          Novo Lancamento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Faturamento Total", value: totais.faturamento, color: "text-blue-400" },
          { label: "Despesas Totais", value: totais.despesas, color: "text-red-400" },
          { label: "Lucro Total", value: totais.lucro, color: totais.lucro >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-5 border border-white/10" style={{background:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-blue-200/50 uppercase tracking-wide font-semibold mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-6 border border-white/10" style={{background:"rgba(255,255,255,0.07)"}}>
        <h3 className="font-semibold text-white mb-4">Evolucao Financeira</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data?.historico ?? []}>
            <defs>
              <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: "8px", background: "#1a2f4e", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "#fff" }} />
            <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#3b82f6" fill="url(#gradFat)" strokeWidth={2} />
            <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" fill="url(#gradDesp)" strokeWidth={2} />
            <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" fill="url(#gradLucro)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <FinanceiroTable clienteId={params.id} periodo={periodo} />
        </div>
        <DespesasChart clienteId={params.id} periodo={periodo} />
      </div>
    </div>
  );
}