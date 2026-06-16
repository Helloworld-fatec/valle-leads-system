// src/components/dashboards/manager/ManagerKpiCards.tsx
// REFACTOR negociação-cêntrico:
//   - Negociações Ativas (snapshot da carteira da equipe)
//   - Vendas (eventos 'won' no período)
//   - Taxa de Fechamento (won / won+lost no período)
//   - Estagnadas (ativas sem movimentação de estágio há 7+ dias — alerta)
import React from "react";
import {
  LuBriefcase,
  LuCircleCheck,
  LuTrendingUp,
  LuCircleAlert,
} from "react-icons/lu";
import type {
  TeamActiveNegotiationsResponse,
  TeamSalesResponse,
  TeamClosingRateResponse,
  StagnantNegotiationsResponse,
} from "../../../services/dashboardService";

interface ManagerKpiCardsProps {
  activeNegotiations: TeamActiveNegotiationsResponse | null;
  sales: TeamSalesResponse | null;
  closingRate: TeamClosingRateResponse | null;
  stagnant: StagnantNegotiationsResponse | null;
  loading: boolean;
}

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
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            {alert && <LuCircleAlert size={20} className="text-amber-500" />}
          </div>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}

export default function ManagerKpiCards({
  activeNegotiations,
  sales,
  closingRate,
  stagnant,
  loading,
}: ManagerKpiCardsProps) {
  const stagnantCount = stagnant?.stagnantNegotiations ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Negociações Ativas"
        value={activeNegotiations?.activeNegotiations ?? "—"}
        sub="carteira atual da equipe"
        icon={LuBriefcase}
        color="#3B82F6"
        loading={loading}
      />
      <KpiCard
        label="Vendas"
        value={sales?.sales ?? "—"}
        sub="no período"
        icon={LuCircleCheck}
        color="#10B981"
        loading={loading}
      />
      <KpiCard
        label="Taxa de Fechamento"
        value={closingRate ? `${closingRate.closingRate.toFixed(1)}%` : "—"}
        sub={
          closingRate
            ? `${closingRate.wonCount} ganhas / ${closingRate.lostCount} perdidas`
            : undefined
        }
        icon={LuTrendingUp}
        color="#F59E0B"
        loading={loading}
      />
      <KpiCard
        label="Estagnadas"
        value={stagnantCount}
        sub="sem movimentação há 7+ dias"
        icon={LuCircleAlert}
        color={stagnantCount > 0 ? "#EF4444" : "#94A3B8"}
        loading={loading}
        alert={stagnantCount > 0}
      />
    </div>
  );
}
