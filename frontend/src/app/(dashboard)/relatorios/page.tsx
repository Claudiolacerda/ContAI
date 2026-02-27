"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { FileText, TrendingUp, Users, AlertTriangle, Download, Loader2 } from "lucide-react";

interface Cliente {
  id: string;
  nomeEmpresa: string;
  cnpj: string;
  regimeTributario: string;
  statusContabil: string;
  nomeResponsavel: string;
  email: string;
}

const statusLabel: Record<string, string> = { EM_DIA: "Em dia", PENDENTE: "Pendente", ATRASADO: "Atrasado" };
const statusColor: Record<string, string> = { EM_DIA: "bg-green-100 text-green-700", PENDENTE: "bg-yellow-100 text-yellow-700", ATRASADO: "bg-red-100 text-red-700" };
const regimeLabel: Record<string, string> = { SIMPLES_NACIONAL: "Simples Nacional", LUCRO_PRESUMIDO: "Lucro Presumido", LUCRO_REAL: "Lucro Real", MEI: "MEI" };

export default function RelatoriosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/clientes")
      .then((res) => setClientes(res.data?.data ?? res.data ?? []))
      .catch(() => setClientes([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: clientes.length,
    emDia: clientes.filter((c) => c.statusContabil === "EM_DIA").length,
    pendente: clientes.filter((c) => c.statusContabil === "PENDENTE").length,
    atrasado: clientes.filter((c) => c.statusContabil === "ATRASADO").length,
  };

  const exportCSV = () => {
    const headers = ["Empresa", "CNPJ", "Regime", "Status", "Responsável", "E-mail"];
    const rows = clientes.map((c) => [c.nomeEmpresa, c.cnpj, regimeLabel[c.regimeTributario] ?? c.regimeTributario, statusLabel[c.statusContabil] ?? c.statusContabil, c.nomeResponsavel, c.email]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-clientes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da sua carteira de clientes</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-brand-500/30 text-sm">
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total de Clientes", value: stats.total, icon: Users, color: "text-brand-500", bg: "bg-brand-50" },
          { label: "Em Dia", value: stats.emDia, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
          { label: "Pendentes", value: stats.pendente, icon: FileText, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Atrasados", value: stats.atrasado, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`${kpi.bg} p-2 rounded-lg`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Lista de Clientes</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum cliente cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Empresa", "CNPJ", "Regime", "Status", "Responsável", "E-mail"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{c.nomeEmpresa}</td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{c.cnpj}</td>
                    <td className="px-5 py-3.5 text-gray-600">{regimeLabel[c.regimeTributario] ?? c.regimeTributario}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[c.statusContabil] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[c.statusContabil] ?? c.statusContabil}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{c.nomeResponsavel}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}