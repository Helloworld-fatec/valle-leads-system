import { ClipboardList, Activity, CheckCircle2, DollarSign } from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import FunnelChart from "../components/dashboard/FunnelChart";
import RecentLeads from "../components/dashboard/RecentLeads";
import PipelineSummary from "../components/dashboard/PipelineSummary";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
          {greeting()}, Suelen! 👋
        </h1>
        <p className="text-sm mt-1 capitalize" style={{ color: "#6B7280" }}>{formatDate()}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Total de Leads"
          value="731"
          icon={<ClipboardList size={20} />}
          iconBg="#2563EB"
          trend={12}
          trendLabel="vs. mês anterior"
        />
        <MetricCard
          title="Leads Ativos"
          value="489"
          icon={<Activity size={20} />}
          iconBg="#8B5CF6"
          trend={8}
          trendLabel="em negociação ativa"
        />
        <MetricCard
          title="Negócios Fechados"
          value="38"
          icon={<CheckCircle2 size={20} />}
          iconBg="#10B981"
          trend={-3}
          trendLabel="vs. mês anterior"
        />
        <MetricCard
          title="Valor Fechado"
          value="R$ 6,1M"
          icon={<DollarSign size={20} />}
          iconBg="#F97316"
          trend={21}
          trendLabel="receita este mês"
        />
      </div>

      {/* Funnel + Pipeline */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8">
        <div className="xl:col-span-3">
          <FunnelChart />
        </div>
        <div className="xl:col-span-2">
          <PipelineSummary />
        </div>
      </div>

      {/* Recent leads */}
      <RecentLeads />
    </div>
  );
}
