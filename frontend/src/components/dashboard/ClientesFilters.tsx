"use client";
import { useQueryState } from "nuqs";
import { ArrowUpDown, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "EM_DIA", label: "Em dia" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "ATRASADO", label: "Atrasado" },
];

const SORT_OPTIONS = [
  { value: "nome_asc", label: "Nome A-Z" },
  { value: "nome_desc", label: "Nome Z-A" },
  { value: "faturamento_desc", label: "Maior faturamento" },
  { value: "faturamento_asc", label: "Menor faturamento" },
  { value: "status", label: "Por status" },
];

export function ClientesFilters() {
  const [status, setStatus] = useQueryState("status", { defaultValue: "" });
  const [sort, setSort] = useQueryState("sort", { defaultValue: "nome_asc" });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 rounded-xl p-1 border border-white/10" style={{background:"rgba(255,255,255,0.07)"}}>
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button key={value} onClick={() => setStatus(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === value ? "bg-blue-500 text-white shadow-sm" : "text-blue-200/60 hover:text-white hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-blue-200/40" />
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="text-sm rounded-xl px-3 py-2 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400/40 cursor-pointer border border-white/10"
          style={{background:"rgba(255,255,255,0.07)"}}>
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} style={{background:"#1a2f4e"}}>{label}</option>
          ))}
        </select>
      </div>
      {status !== "" && (
        <button onClick={() => setStatus("")} className="flex items-center gap-1.5 text-sm text-blue-200/50 hover:text-red-400 transition-colors">
          <X className="w-3.5 h-3.5" />
          Limpar
        </button>
      )}
    </div>
  );
}