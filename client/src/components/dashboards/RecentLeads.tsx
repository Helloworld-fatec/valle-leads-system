const stageColors: Record<string, { bg: string; text: string }> = {
  "Novo": { bg: "#EFF6FF", text: "#2563EB" },
  "Contato Inicial": { bg: "#F5F3FF", text: "#7C3AED" },
  "Qualificação": { bg: "#FFFBEB", text: "#D97706" },
  "Proposta": { bg: "#FFF7ED", text: "#EA580C" },
  "Negociação": { bg: "#FEF2F2", text: "#DC2626" },
  "Fechamento": { bg: "#ECFDF5", text: "#059669" },
};

const sourceIcons: Record<string, string> = {
  "Indicação": "👤",
  "Site": "🌐",
  "WhatsApp": "💬",
  "Instagram": "📸",
  "Google": "🔍",
};

const leads = [
  { name: "Carlos Mendes", email: "carlos@email.com", stage: "Proposta", source: "Indicação", value: "R$ 85.000" },
  { name: "Ana Beatriz Lima", email: "ana.lima@gmail.com", stage: "Negociação", source: "WhatsApp", value: "R$ 120.000" },
  { name: "Roberto Souza", email: "roberto@empresa.com", stage: "Qualificação", source: "Site", value: "R$ 45.000" },
  { name: "Fernanda Castro", email: "fcastro@email.com", stage: "Novo", source: "Instagram", value: "R$ 62.000" },
  { name: "Marcelo Dias", email: "marcelo.d@gmail.com", stage: "Fechamento", source: "Google", value: "R$ 210.000" },
  { name: "Juliana Rocha", email: "ju.rocha@email.com", stage: "Contato Inicial", source: "Indicação", value: "R$ 38.000" },
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const avatarColors = ["#2563EB", "#8B5CF6", "#F97316", "#10B981", "#EF4444", "#F59E0B"];

export default function RecentLeads() {
  return (
    <div
      className="rounded-xl shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#E5E7EB" }}>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>Leads Recentes</h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Últimas atividades</p>
        </div>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:bg-blue-50"
          style={{ color: "#2563EB", borderColor: "#DBEAFE" }}
        >
          Ver todos
        </button>
      </div>

      <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
        {leads.map((lead, i) => {
          const sc = stageColors[lead.stage] ?? { bg: "#F1F5F9", text: "#6B7280" };
          return (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-all cursor-pointer">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: avatarColors[i % avatarColors.length] }}
              >
                {initials(lead.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#111827" }}>{lead.name}</p>
                <p className="text-xs truncate" style={{ color: "#9CA3AF" }}>{lead.email}</p>
              </div>

              {/* Source */}
              <span className="text-xs hidden md:block" style={{ color: "#9CA3AF" }}>
                {sourceIcons[lead.source]} {lead.source}
              </span>

              {/* Value */}
              <span className="text-sm font-semibold hidden lg:block" style={{ color: "#111827" }}>
                {lead.value}
              </span>

              {/* Stage badge */}
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ background: sc.bg, color: sc.text }}
              >
                {lead.stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
