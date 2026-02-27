"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Calendar, AlertCircle } from "lucide-react";

interface Vencimento {
  id: string;
  descricao: string;
  dataVencimento: string;
  valor?: number;
  tipo: string;
}

interface Props {
  clienteId: string;
}

export function ClienteProximosVencimentos({ clienteId }: Props) {
  const [vencimentos, setVencimentos] = useState<Vencimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/clientes/${clienteId}/obrigacoes?status=PENDENTE&limit=5`)
      .then((res) => setVencimentos(res.data?.data ?? res.data ?? []))
      .catch(() => setVencimentos([]))
      .finally(() => setLoading(false));
  }, [clienteId]);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const due = new Date(dateStr);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  if (loading) return <div className="h-32 bg-white rounded-xl animate-pulse" />;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-brand-500" />
        <h3 className="font-semibold text-gray-800 text-sm">Próximos Vencimentos</h3>
      </div>
      {vencimentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Nenhum vencimento próximo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vencimentos.map((v) => {
            const days = getDaysUntil(v.dataVencimento);
            const isUrgent = days <= 3;
            const isWarning = days <= 7 && days > 3;
            return (
              <div key={v.id} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{v.descricao}</p>
                  <p className="text-xs text-gray-400">{formatDate(v.dataVencimento)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                  isUrgent ? "bg-red-100 text-red-600" : isWarning ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
                }`}>
                  {days < 0 ? "Vencido" : days === 0 ? "Hoje" : `${days}d`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}