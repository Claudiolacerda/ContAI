"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  Plus, FileText, Clock, CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: "backlog" | "em_andamento" | "revisao" | "concluida";
  prioridade: "baixa" | "media" | "alta" | "urgente";
  prazo?: string;
  tags: string[];
}

interface PageProps {
  params: { id: string };
}

const COLUNAS = [
  { id: "backlog", label: "Backlog", color: "slate" },
  { id: "em_andamento", label: "Em Andamento", color: "blue" },
  { id: "revisao", label: "Revisão", color: "amber" },
  { id: "concluida", label: "Concluído", color: "emerald" },
] as const;

const PRIORIDADE_COLORS: Record<string, string> = {
  urgente: "bg-red-100 text-red-700 border-red-200",
  alta:    "bg-orange-100 text-orange-700 border-orange-200",
  media:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  baixa:   "bg-slate-100 text-slate-600 border-slate-200",
};

const COLUNA_STYLES: Record<string, string> = {
  slate:   "border-slate-200 bg-slate-50",
  blue:    "border-blue-200 bg-blue-50",
  amber:   "border-amber-200 bg-amber-50",
  emerald: "border-emerald-200 bg-emerald-50",
};

export default function ClienteAndamentoPage({ params }: PageProps) {
  const qc = useQueryClient();

  const { data: tarefas = [], isLoading } = useQuery<Tarefa[]>({
    queryKey: ["cliente-tarefas", params.id],
    queryFn: () => api.get(`/clientes/${params.id}/tarefas`).then(r => r.data),
  });

  const moverTarefa = useMutation({
    mutationFn: ({ tarefaId, novoStatus }: { tarefaId: string; novoStatus: string }) =>
      api.patch(`/tarefas/${tarefaId}`, { status: novoStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cliente-tarefas", params.id] });
      toast.success("Tarefa atualizada");
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {COLUNAS.map((col) => (
          <div key={col.id} className="h-96 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">Andamento Contábil</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {tarefas.length} tarefas · {tarefas.filter(t => t.status === "concluida").length} concluídas
          </p>
        </div>
        <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUNAS.map((coluna) => {
          const tarefasColuna = tarefas.filter(t => t.status === coluna.id);
          return (
            <div key={coluna.id} className={`rounded-xl border-2 ${COLUNA_STYLES[coluna.color]} min-h-[400px] flex flex-col`}>
              {/* Column header */}
              <div className="p-3 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-700">{coluna.label}</span>
                <span className="text-xs bg-white border border-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                  {tarefasColuna.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="p-2 space-y-2 flex-1">
                {tarefasColuna.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-card-hover transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{tarefa.titulo}</p>
                      <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </div>

                    {tarefa.descricao && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tarefa.descricao}</p>
                    )}

                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORIDADE_COLORS[tarefa.prioridade]}`}>
                        {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                      </span>
                      {tarefa.prazo && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(tarefa.prazo)}
                        </span>
                      )}
                    </div>

                    {/* Quick move buttons */}
                    {coluna.id !== "concluida" && (
                      <button
                        onClick={() => {
                          const nextStatus = { backlog: "em_andamento", em_andamento: "revisao", revisao: "concluida" }[coluna.id];
                          if (nextStatus) moverTarefa.mutate({ tarefaId: tarefa.id, novoStatus: nextStatus });
                        }}
                        className="mt-2 w-full text-xs text-brand-600 hover:text-brand-700 font-medium py-1 hover:bg-brand-50 rounded transition-colors"
                      >
                        Mover para próxima fase →
                      </button>
                    )}
                  </div>
                ))}

                {tarefasColuna.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">Nenhuma tarefa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Documents section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          Documentos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Recebidos
            </p>
            <div className="space-y-1.5">
              {["Extrato Bancário - Fev/25", "NF de Serviços - Fev/25", "Folha de Pagamento"].map(doc => (
                <div key={doc} className="text-sm text-slate-600 py-1.5 px-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  {doc}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Aguardando
            </p>
            <div className="space-y-1.5">
              {["DAS - Fev/25", "Comprovante FGTS", "Notas de Compras"].map(doc => (
                <div key={doc} className="text-sm text-slate-600 py-1.5 px-3 bg-amber-50 border border-amber-100 rounded-lg">
                  {doc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
