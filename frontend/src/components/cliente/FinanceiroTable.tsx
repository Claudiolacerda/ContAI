"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Financeiro Table ─────────────────────────────────────────────────────────
interface FinanceiroTableProps {
  clienteId: string;
  periodo: string;
}

export function FinanceiroTable({ clienteId, periodo }: FinanceiroTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["lancamentos", clienteId, periodo],
    queryFn: () => api.get(`/clientes/${clienteId}/lancamentos?periodo=${periodo}`).then(r => r.data),
  });

  const lancamentos = data?.data ?? [];

  const STATUS_CLASSES: Record<string, string> = {
    pago:     "bg-emerald-50 text-emerald-700",
    pendente: "bg-amber-50 text-amber-700",
    vencido:  "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Lançamentos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 bg-slate-50">
              <th className="px-6 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : lancamentos.map((l: {
                  id: string; descricao: string; tipo: string;
                  categoria: string; dataCompetencia: string;
                  valor: number; status: string;
                }) => (
                  <tr key={l.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">{l.descricao}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        l.tipo === "RECEITA" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {l.tipo === "RECEITA" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{l.categoria}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(l.dataCompetencia)}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${
                      l.tipo === "RECEITA" ? "text-emerald-700" : "text-slate-700"
                    }`}>
                      {l.tipo === "RECEITA" ? "+" : "-"}{formatCurrency(l.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_CLASSES[l.status] ?? ""}`}>
                        {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!isLoading && lancamentos.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">Nenhum lançamento no período</div>
        )}
      </div>
    </div>
  );
}

// ─── Despesas Chart ───────────────────────────────────────────────────────────
interface DespesasChartProps {
  clienteId: string;
  periodo: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function DespesasChart({ clienteId, periodo }: DespesasChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["despesas-categorias", clienteId, periodo],
    queryFn: () => api.get(`/clientes/${clienteId}/despesas?periodo=${periodo}`).then(r => r.data),
  });

  const despesas = data?.categorias ?? [];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
      <h3 className="font-semibold text-slate-800 mb-4">Despesas por Categoria</h3>
      {isLoading ? (
        <div className="h-52 bg-slate-50 rounded-lg animate-pulse" />
      ) : despesas.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Sem despesas no período</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={despesas}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="valor"
              nameKey="categoria"
            >
              {despesas.map((_: unknown, index: number) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: 11 }}
            />
            <Legend
              formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
