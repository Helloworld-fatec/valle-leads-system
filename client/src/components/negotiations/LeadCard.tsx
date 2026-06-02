// src/components/negotiations/LeadCard.tsx
import { Phone, Mail, Flame, Thermometer, Snowflake, Globe, MessageCircle, Search, UserCheck, MapPin } from "lucide-react";

import { LuInstagram as Instagram } from "react-icons/lu";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  value: string;
  rawValue: number;
  importance: "quente" | "morno" | "frio";
  source: string;
  attendant: string;
};

const importanceConfig = {
  quente: { icon: <Flame size={11} />, color: "#EF4444", bg: "#FFF1F2", label: "Quente" },
  morno:  { icon: <Thermometer size={11} />, color: "#F59E0B", bg: "#FFFBEB", label: "Morno"  },
  frio:   { icon: <Snowflake size={11} />,   color: "#3B82F6", bg: "#EFF6FF", label: "Frio"   },
};

const sourceConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "Indicação": { icon: <UserCheck size={11} />,   color: "#8B5CF6" },
  "Site":      { icon: <Globe size={11} />,        color: "#0EA5E9" },
  "WhatsApp":  { icon: <MessageCircle size={11} />, color: "#22C55E" },
  "Instagram": { icon: <Instagram size={11} />,    color: "#EC4899" },
  "Google":    { icon: <Search size={11} />,       color: "#F59E0B" },
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const avatarGradients = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#3B82F6,#06B6D4)",
  "linear-gradient(135deg,#F97316,#EF4444)",
  "linear-gradient(135deg,#10B981,#0EA5E9)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#06B6D4,#3B82F6)",
];

type Props = {
  lead: Lead;
  color: string;
};

export default function LeadCard({ lead, color }: Props) {
  const imp    = importanceConfig[lead.importance];
  const src    = sourceConfig[lead.source];
  const idx    = lead.id.charCodeAt(0) % avatarGradients.length;

  return (
    <div
      className="rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
      style={{
        background: "#ffffff",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
      }}
    >
      {/* Top: avatar + name + importance */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: avatarGradients[idx] }}
          >
            {initials(lead.name)}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-800">{lead.name}</p>
            {src ? (
              <div className="flex items-center gap-1 mt-0.5" style={{ color: src.color }}>
                {src.icon}
                <span className="text-[11px] font-medium">{lead.source}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                <MapPin size={11} />
                <span className="text-[11px]">{lead.source}</span>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0"
          style={{ background: imp.bg, color: imp.color }}
        >
          {imp.icon}
          <span>{imp.label}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Mail size={10} className="shrink-0 opacity-60" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Phone size={10} className="shrink-0 opacity-60" />
          <span>{lead.phone}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <span className="text-sm font-bold" style={{ color }}>
          {lead.value}
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: "linear-gradient(135deg,#94A3B8,#64748B)" }}
          >
            {lead.attendant.split(" ")[0][0]}{lead.attendant.split(" ")[1]?.[0] ?? ""}
          </div>
          <span className="text-xs text-slate-400">{lead.attendant.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}