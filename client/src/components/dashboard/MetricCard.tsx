import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  trend?: number; // percentage
  trendLabel?: string;
};

export default function MetricCard({ title, value, icon, iconBg, trend, trendLabel }: Props) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: isPositive ? "#D1FAE5" : "#FEE2E2",
              color: isPositive ? "#065F46" : "#991B1B",
            }}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold" style={{ color: "#111827" }}>{value}</p>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{title}</p>
        {trendLabel && (
          <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{trendLabel}</p>
        )}
      </div>
    </div>
  );
}
