// src/components/dashboards/manager/ManagerKpiCards.tsx
import React from "react";
import { 
  LuClipboardList, 
  LuCircleCheck, 
  LuTrendingUp, 
  LuTrophy,
  LuCircleAlert,
} from "react-icons/lu";
import type { TeamKpisResponse, TopAttendantResponse } from "../../../services/dashboardService";

interface ManagerKpiCardsProps {
  teamKpis: TeamKpisResponse | null;
  topAttendant: TopAttendantResponse | null;
  loading: boolean;
}

// Adicionamos a prop "alert" opcional para renderizar o ícone de aviso
interface CardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
  alert?: boolean; 
}

function KpiCard({ label, value, sub, icon: Icon, color, loading, alert }: CardProps) {
  return (
    <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      {/* Background Decorator */}
      <div 
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon size={20} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-4 w-32 bg-slate-50 animate-pulse rounded-md" />
        </div>
      ) : (
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            {value}
          </h3>
          {sub && (
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
              {/* O alerta agora depende da prop que o pai enviou */}
              {alert && <LuCircleAlert size={14} className="text-amber-500" />}
              {sub}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagerKpiCards({ teamKpis, topAttendant, loading }: ManagerKpiCardsProps) {
  const rate = teamKpis ? `${teamKpis.conversionRate.toFixed(1)}%` : "—";
  const topName = topAttendant?.topAttendant?.name ?? "Nenhum";
  const topConversions = topAttendant?.topAttendant?.conversions ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Total de Leads"
        value={loading ? "—" : (teamKpis?.totalLeads ?? 0).toLocaleString()}
        sub="Leads captados pela equipe"
        icon={LuClipboardList}
        color="#3B82F6" // Blue 500
        loading={loading}
      />
      
      <KpiCard
        label="Leads Convertidos"
        value={loading ? "—" : (teamKpis?.convertedLeads ?? 0).toLocaleString()}
        sub="Vendas fechadas no período"
        icon={LuCircleCheck}
        color="#10B981" // Emerald 500
        loading={loading}
      />
      
      <KpiCard
        label="Taxa de Conversão"
        value={loading ? "—" : rate}
        sub={teamKpis ? `${teamKpis.stagnantLeads} leads parados` : "Aguardando dados"}
        icon={LuTrendingUp}
        color="#6366F1" // Indigo 500
        loading={loading}
        // Avaliamos a condição aqui no pai, e mandamos a instrução para o filho!
        alert={(teamKpis?.stagnantLeads ?? 0) > 0} 
      />
      
      <KpiCard
        label="Melhor Atendente"
        value={loading ? "—" : topName}
        sub={topAttendant?.topAttendant ? `${topConversions} conversões` : "Sem ranking"}
        icon={LuTrophy}
        color="#F59E0B" // Amber 500
        loading={loading}
      />
    </div>
  );
}