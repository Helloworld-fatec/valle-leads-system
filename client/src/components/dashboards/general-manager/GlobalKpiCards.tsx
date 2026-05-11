// src/components/dashboards/general-manager/GlobalKpiCards.tsx
import React from "react";
import { 
  LuTarget, 
  LuBadgeCheck, 
  LuTrendingUp, 
  LuTrophy 
} from "react-icons/lu";
import type { GlobalKpisResponse, TopTeamResponse } from "../../../services/dashboardService";

interface Props {
  kpis: GlobalKpisResponse | null;
  topTeam: TopTeamResponse | null;
  loading: boolean;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  loading: boolean;
}

function KpiCard({ label, value, sub, icon: Icon, accent, loading }: KpiCardProps) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      {/* Elemento Decorativo de Fundo */}
      <div 
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-125"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 relative z-10">
          <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-4 w-36 bg-slate-50 animate-pulse rounded-md" />
        </div>
      ) : (
        <div className="relative z-10">
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {value}
          </h3>
          {sub && (
            <p className="text-xs font-semibold text-slate-500 mt-1.5">
              {sub}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function GlobalKpiCards({ kpis, topTeam, loading }: Props) {
  const convRate = kpis ? `${kpis.globalConversionRate.toFixed(1)}%` : "—";
  const topTeamName = topTeam?.topTeam?.name ?? "—";
  const topTeamConv = topTeam?.topTeam ? `${topTeam.topTeam.conversions} conversões` : "Sem dados";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <KpiCard
        label="Total de Leads"
        value={loading ? "—" : (kpis?.totalLeads ?? 0).toLocaleString("pt-BR")}
        sub="Leads captados globalmente"
        icon={LuTarget}
        accent="#3B82F6" // Azul vibrante
        loading={loading}
      />
      <KpiCard
        label="Total de Vendas"
        value={loading ? "—" : (kpis?.totalSales ?? 0).toLocaleString("pt-BR")}
        sub="Conversões confirmadas"
        icon={LuBadgeCheck}
        accent="#10B981" // Esmeralda
        loading={loading}
      />
      <KpiCard
        label="Taxa de Conversão"
        value={loading ? "—" : convRate}
        sub={kpis ? `${(kpis?.totalSales ?? 0).toLocaleString("pt-BR")} de ${(kpis?.totalLeads ?? 0).toLocaleString("pt-BR")} leads` : ""}
        icon={LuTrendingUp}
        accent="#8B5CF6" // Violeta/Roxo (distingue da taxa de equipa)
        loading={loading}
      />
      <KpiCard
        label="Melhor Equipa"
        value={loading ? "—" : topTeamName}
        sub={topTeamConv}
        icon={LuTrophy}
        accent="#F59E0B" // Âmbar/Dourado
        loading={loading}
      />
    </div>
  );
}