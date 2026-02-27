import { Suspense } from "react";
import Link from "next/link";
import { ClientesGrid } from "@/components/dashboard/ClientesGrid";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ClientesFilters } from "@/components/dashboard/ClientesFilters";
import { ClientesGridSkeleton } from "@/components/dashboard/ClientesGridSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Meus Clientes</h1>
          <p className="text-blue-200/50 text-sm mt-0.5">Gerencie todos os seus clientes em um so lugar</p>
        </div>
        <Link href="/novo-cliente" className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2">
          <span className="text-base leading-none">+</span>
          Novo Cliente
        </Link>
      </div>
      <Suspense fallback={<div className="h-24 rounded-2xl border border-white/10 animate-pulse" style={{background:"rgba(255,255,255,0.05)"}} />}>
        <DashboardStats />
      </Suspense>
      <ClientesFilters />
      <Suspense fallback={<ClientesGridSkeleton />}>
        <ClientesGrid />
      </Suspense>
    </div>
  );
}