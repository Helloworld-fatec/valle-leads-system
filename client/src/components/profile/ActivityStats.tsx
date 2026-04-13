import { Target, TrendingUp, Clock, Award } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}

const stats: Stat[] = [
  {
    label: "Leads atribuídos",
    value: "47",
    sub: "neste mês",
    icon: <Target size={16} />,
    color: "#2563EB",
  },
  {
    label: "Conversões",
    value: "12",
    sub: "negócios fechados",
    icon: <Award size={16} />,
    color: "#10B981",
  },
  {
    label: "Taxa de conversão",
    value: "25,5%",
    sub: "acima da média",
    icon: <TrendingUp size={16} />,
    color: "#8B5CF6",
  },
  {
    label: "Tempo médio",
    value: "4,2d",
    sub: "por negociação",
    icon: <Clock size={16} />,
    color: "#F59E0B",
  },
];

export default function ActivityStats() {
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
            <p className="text-xl font-bold text-gray-900 leading-none">{stat.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-1">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
