"use client";

import { useState } from "react";
import { FileText, Download, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";

const RELATORIOS_MOCK = [
  { id: "1", nome: "Relatorio Mensal - Janeiro 2025", tipo: "mensal", mes: "2025-01-01", status: "pronto" },
  { id: "2", nome: "Relatorio Mensal - Fevereiro 2025", tipo: "mensal", mes: "2025-02-01", status: "pronto" },
  { id: "3", nome: "Relatorio Anual - 2024", tipo: "anual", mes: "2024-01-01", status: "pronto" },
];

export default function ClienteRelatoriosPage() {
  const [gerando, setGerando] = useState<string | null>(null);

  const handleGerar = async (tipo: string) => {
    setGerando(tipo);
    await new Promise((r) => setTimeout(r, 2000));
    setGerando(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Gerar Novo Relatorio
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { tipo: "mensal", label: "Relatorio Mensal" },
            { tipo: "anual", label: "Relatorio Anual" },
          ].map(({ tipo, label }) => (
            <button
              key={tipo}
              onClick={() => handleGerar(tipo)}
              disabled={gerando !== null}
              className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left disabled:opacity-50"
            >
              {gerando === tipo ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
              <span className="font-medium text-slate-800 text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Historico de Relatorios</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {RELATORIOS_MOCK.map((rel) => (
            <div key={rel.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{rel.nome}</p>
                  <p className="text-xs text-slate-400">{formatDate(rel.mes, "MMM yyyy")}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-all">
                <Download className="w-3.5 h-3.5" />
                Baixar PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}