// src/components/dashboards/attendant/KpiCard.tsx
import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  loading?: boolean;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "#EFF6FF", // Azul bem suave
  loading = false,
  trend,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100" />
          <div className="w-16 h-6 rounded-full bg-slate-100" />
        </div>
        <div className="w-24 h-8 rounded-lg bg-slate-100 mb-2" />
        <div className="w-32 h-4 rounded-lg bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      {/* Detalhe de design: Bolha de cor suave no fundo que expande no hover */}
      <div 
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-30 transition-transform duration-500 group-hover:scale-150"
        style={{ background: iconBg }}
      />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide shadow-sm"
            style={{
              background: trend.positive ? "#F0FDF4" : "#FEF2F2",
              color: trend.positive ? "#16A34A" : "#DC2626",
            }}
          >
            {trend.value}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
          {value}
        </p>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}