"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { ChevronLeft, Building2, Phone, Mail, Edit } from "lucide-react";

const STATUS_CONFIG = {
  EM_DIA:   { label: "Em dia",   classes: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  pendente: { label: "Pendente", classes: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  atrasado: { label: "Atrasado", classes: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
};

interface ClienteHeaderProps {
  clienteId: string;
}

export function ClienteHeader({ clienteId }: ClienteHeaderProps) {
  const { data: cliente, isLoading } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}`).then(r => r.data),
  });

  return (
    <div className="mb-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Clientes
        </Link>
        <span className="text-slate-300">/</span>
        {isLoading ? (
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        ) : (
          <span className="text-sm font-medium text-slate-700">{cliente?.nomeEmpresa}</span>
        )}
      </div>

      {/* Client header */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 mb-0">
        {isLoading ? (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 bg-slate-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-100 rounded w-48" />
              <div className="h-3.5 bg-slate-100 rounded w-32" />
            </div>
          </div>
        ) : cliente ? (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-brand-700">
                  {cliente.nomeEmpresa.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900">{cliente.nomeEmpresa}</h1>
                  {(() => {
                    const cfg = STATUS_CONFIG[cliente.statusContabil as keyof typeof STATUS_CONFIG] ?? { label: "Pendente", classes: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
                    return (
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    CNPJ: {cliente.cnpj}
                  </span>
                  {cliente.regime && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                      {cliente.regime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                  {cliente.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{cliente.email}</span>
                  )}
                  {cliente.telefone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{cliente.telefone}</span>
                  )}
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-brand-600 border border-slate-200 hover:border-brand-200 rounded-lg transition-all">
              <Edit className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
