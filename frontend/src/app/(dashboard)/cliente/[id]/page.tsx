import { Suspense } from "react";
import { ClienteKPIs } from "@/components/cliente/ClienteKPIs";
import { ClienteFinanceiroChart } from "@/components/cliente/ClienteFinanceiroChart";
import { ClientePendencias } from "@/components/cliente/ClientePendencias";
import { ClienteProximosVencimentos } from "@/components/cliente/ClienteProximosVencimentos";

interface PageProps {
  params: { id: string };
}

export default function ClienteOverviewPage({ params }: PageProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* KPI Cards */}
      <Suspense fallback={<div className="grid grid-cols-3 gap-4"><div className="h-28 bg-white rounded-xl animate-pulse" /><div className="h-28 bg-white rounded-xl animate-pulse" /><div className="h-28 bg-white rounded-xl animate-pulse" /></div>}>
        <ClienteKPIs clienteId={params.id} />
      </Suspense>

      {/* Charts + Pendências */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<div className="h-72 bg-white rounded-xl animate-pulse" />}>
            <ClienteFinanceiroChart clienteId={params.id} />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<div className="h-32 bg-white rounded-xl animate-pulse" />}>
            <ClienteProximosVencimentos clienteId={params.id} />
          </Suspense>
          <Suspense fallback={<div className="h-32 bg-white rounded-xl animate-pulse" />}>
            <ClientePendencias clienteId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
