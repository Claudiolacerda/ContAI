"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/formatters";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

interface ClienteFinanceiroChartProps {
  clienteId: string;
}

export function ClienteFinanceiroChart({ clienteId }: ClienteFinanceiroChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["cliente-financeiro-chart", clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}/financeiro?periodo=6m`).then(r => r.data),
  });

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800">Desempenho Financeiro</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Últimos 6 meses</span>
      </div>

      {isLoading ? (
        <div className="h-56 bg-slate-50 rounded-lg animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data?.historico ?? []} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="cgFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cgLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), ""]}
              contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Area
              type="monotone"
              dataKey="faturamento"
              name="Faturamento"
              stroke="#3b82f6"
              fill="url(#cgFat)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "white" }}
            />
            <Area
              type="monotone"
              dataKey="lucro"
              name="Lucro"
              stroke="#10b981"
              fill="url(#cgLucro)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "white" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
