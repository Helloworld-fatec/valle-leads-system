// src/components/dashboards/general-manager/GlobalKpiCards.tsx
// REFACTOR negociação-cêntrico:
//   - Negociações Ativas (snapshot global)
//   - Vendas (eventos 'won' no período)
//   - Valor Vendido R$ (período) — com aviso de vendas sem valor cadastrado
//   - Valor em Pipeline R$ (snapshot) — quanto há "na mesa" agora
import React from "react";
import {
  LuBriefcase,
  LuBadgeCheck,
  LuBanknote,
  LuChartPie,
  LuTriangleAlert,
} from "react-icons/lu";
import type {
  GlobalActiveNegotiationsResponse,
  GlobalSalesResponse,
  SalesValueResponse,
  PipelineValueResponse,
} from "../../../services/dashboardService";
import { formatBRL, formatBRLCompact } from "../../../services/dashboardService";

interface Props {
  activeNegotiations: GlobalActiveNegotiationsResponse | null;
  sales: GlobalSalesResponse | null;
  salesValue: SalesValueResponse | null;
  pipelineValue: PipelineValueResponse | null;
  loading: boolean;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  valueTitle?: string; // tooltip com o valor completo (para R$ compactado)
  sub?: string;
  warn?: string; // aviso âmbar (ex: vendas sem valor cadastrado)
  icon: React.ElementType;
  accent: string;
  loading: boolean;
}

function KpiCard({ label, value, valueTitle, sub, warn, icon: Icon, accent, loading }: KpiCardProps) {
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
          <h3
            className="text-3xl font-extrabold text-slate-800 tracking-tight"
            title={valueTitle}
          >
            {value}
          </h3>
          {sub && <p className="text-xs font-semibold text-slate-500 mt-1.5">{sub}</p>}
          {warn && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
              <LuTriangleAlert size={12} />
              {warn}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function GlobalKpiCards({
  activeNegotiations,
  sales,
  salesValue,
  pipelineValue,
  loading,
}: Props) {
  const sv = salesValue?.salesValue ?? 0;
  const pv = pipelineValue?.pipelineValue ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        label="Negociações Ativas"
        value={activeNegotiations?.activeNegotiations ?? "—"}
        sub="carteira atual da empresa"
        icon={LuBriefcase}
        accent="#3B82F6"
        loading={loading}
      />
      <KpiCard
        label="Vendas"
        value={sales?.sales ?? "—"}
        sub="no período"
        icon={LuBadgeCheck}
        accent="#10B981"
        loading={loading}
      />
      <KpiCard
        label="Valor Vendido"
        value={formatBRLCompact(sv)}
        valueTitle={formatBRL(sv)}
        sub="no período"
        warn={
          salesValue && salesValue.salesWithoutValue > 0
            ? `${salesValue.salesWithoutValue} venda(s) sem valor cadastrado`
            : undefined
        }
        icon={LuBanknote}
        accent="#16A34A"
        loading={loading}
      />
      <KpiCard
        label="Valor em Pipeline"
        value={formatBRLCompact(pv)}
        valueTitle={formatBRL(pv)}
        sub="carteira ativa (na mesa)"
        warn={
          pipelineValue && pipelineValue.negotiationsWithoutValue > 0
            ? `${pipelineValue.negotiationsWithoutValue} negociação(ões) sem valor`
            : undefined
        }
        icon={LuChartPie}
        accent="#8B5CF6"
        loading={loading}
      />
    </div>
  );
}
