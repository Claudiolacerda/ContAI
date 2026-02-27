"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults } = useQuery({
    queryKey: ["search", query],
    queryFn: () => api.get(`/clientes?search=${query}&limit=5`).then(r => r.data.data),
    enabled: query.length > 1,
  });
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <header className="h-16 flex items-center px-6 gap-4 flex-shrink-0 border-b border-white/10" style={{background: "rgba(15, 30, 55, 0.4)", backdropFilter: "blur(20px)"}}>
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar cliente, CNPJ..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/40 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:bg-white/10 transition-all"
        />
        {showResults && searchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1e37] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            {searchResults.map((c: { id: string; nomeEmpresa: string; cnpj: string }) => (
              <button key={c.id} onClick={() => { router.push(`/cliente/${c.id}`); setShowResults(false); setQuery(""); }} className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between">
                <span className="text-sm font-medium text-white">{c.nomeEmpresa}</span>
                <span className="text-xs text-blue-300/50">{c.cnpj}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-blue-200/60 hover:text-white">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
        </button>
      </div>
    </header>
  );
}