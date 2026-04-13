import { Phone, Mail, Flame, Thermometer, Snowflake } from "lucide-react";

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
  quente: { icon: <Flame size={12} />, color: "#EF4444", bg: "#FEF2F2", label: "Quente" },
  morno: { icon: <Thermometer size={12} />, color: "#F59E0B", bg: "#FFFBEB", label: "Morno" },
  frio: { icon: <Snowflake size={12} />, color: "#3B82F6", bg: "#EFF6FF", label: "Frio" },
};

const sourceIcons: Record<string, string> = {
  "Indicação": "👤",
  "Site": "🌐",
  "WhatsApp": "💬",
  "Instagram": "📸",
  "Google": "🔍",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const avatarColors = ["#2563EB", "#8B5CF6", "#F97316", "#10B981", "#EF4444", "#F59E0B", "#06B6D4"];

type Props = {
  lead: Lead;
  color: string;
};

export default function LeadCard({ lead, color }: Props) {
  const imp = importanceConfig[lead.importance];
  const idx = lead.id.charCodeAt(0) % avatarColors.length;

  return (
    <div
      className="rounded-xl p-4 border shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Top: avatar + name + importance */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: avatarColors[idx] }}
          >
            {initials(lead.name)}
          </div>
          <div>
            <p className="text-sm font-semibold leading-none" style={{ color: "#111827" }}>{lead.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
              {sourceIcons[lead.source] ?? "📌"} {lead.source}
            </p>
          </div>
        </div>

        {/* Importance dot */}
        <div
          className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: imp.bg, color: imp.color }}
        >
          {imp.icon}
          <span>{imp.label}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
          <Mail size={11} />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
          <Phone size={11} />
          <span>{lead.phone}</span>
        </div>
      </div>

      {/* Footer: value + attendant */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: "#F1F5F9" }}
      >
        <span className="text-sm font-bold" style={{ color }}>
          {lead.value}
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: "#6B7280" }}
          >
            {lead.attendant.split(" ")[0][0]}{lead.attendant.split(" ")[1]?.[0] ?? ""}
          </div>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>{lead.attendant.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}
