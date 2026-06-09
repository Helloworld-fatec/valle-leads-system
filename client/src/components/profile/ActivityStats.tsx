import { useEffect, useState } from "react";
import { Target, TrendingUp, Clock, Award } from "lucide-react";
import { useApi } from "../../services/api";

export default function ActivityStats() {
  const { apiFetch } = useApi();

  const [activeLeads, setActiveLeads] = useState<string | null>(null);
  const [convertedLeads, setConvertedLeads] = useState<string | null>(null);
  const [conversionRate, setConversionRate] = useState<string | null>(null);
  const [avgServiceTime, setAvgServiceTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      setLoading(true);
      try {
        const [activeRes, convertedRes, rateRes, avgRes] = await Promise.all([
          apiFetch("/api/dashboards/attendant/kpi/active-leads"),
          apiFetch("/api/dashboards/attendant/kpi/converted-leads"),
          apiFetch("/api/dashboards/attendant/kpi/conversion-rate"),
          apiFetch("/api/dashboards/attendant/kpi/avg-service-time"),
        ]);

        const [active, converted, rate, avg] = await Promise.all([
          activeRes.json(),
          convertedRes.json(),
          rateRes.json(),
          avgRes.json(),
        ]);

        setActiveLeads(String(active.activeLeads ?? "—"));
        setConvertedLeads(String(converted.convertedLeads ?? "—"));
        setConversionRate(`${rate.conversionRate ?? "—"}%`);
        setAvgServiceTime(`${avg.avgServiceTimeHours ?? "—"}h`);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, [apiFetch]);

  const stats = [
    {
      label: "Leads ativos",
      value: activeLeads,
      sub: "neste mês",
      icon: <Target size={16} />,
      color: "#2563EB",
    },
    {
      label: "Conversões",
      value: convertedLeads,
      sub: "negócios fechados",
      icon: <Award size={16} />,
      color: "#10B981",
    },
    {
      label: "Taxa de conversão",
      value: conversionRate,
      sub: "do total de leads",
      icon: <TrendingUp size={16} />,
      color: "#8B5CF6",
    },
    {
      label: "Tempo médio",
      value: avgServiceTime,
      sub: "por negociação",
      icon: <Clock size={16} />,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Minha performance</h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3.5 border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {loading ? "..." : stat.value}
            </p>
            <p className="text-xs font-medium text-gray-700 mt-1">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}