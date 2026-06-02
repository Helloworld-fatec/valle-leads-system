// src/components/negotiations/PipelineTopBar.tsx

import { TrendingUp, Users, CheckCircle2 } from "lucide-react";

type Props = {
  totalValue: string;
  activeLeads: number;
  closedThisMonth: number;
};

export default function PipelineTopBar({ totalValue, activeLeads, closedThisMonth }: Props) {
  const stats = [
    {
      label: "Total em Pipeline",
      value: totalValue,
      icon: <TrendingUp size={18} />,
      color: "#2563EB",
      bg: "#EFF6FF",
      iconBg: "linear-gradient(135deg,#2563EB,#6366F1)",
    },
    {
      label: "Leads Ativos",
      value: String(activeLeads),
      icon: <Users size={18} />,
      color: "#0F172A",
      bg: "#F8FAFC",
      iconBg: "linear-gradient(135deg,#64748B,#475569)",
    },
    {
      label: "Fechados este mês",
      value: String(closedThisMonth),
      icon: <CheckCircle2 size={18} />,
      color: "#10B981",
      bg: "#F0FDF4",
      iconBg: "linear-gradient(135deg,#10B981,#0EA5E9)",
    },
  ];

  return (
    <div className="flex items-center gap-4 flex-wrap mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl"
          style={{
            background: s.bg,
            border: "1.5px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: s.iconBg }}
          >
            {s.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}