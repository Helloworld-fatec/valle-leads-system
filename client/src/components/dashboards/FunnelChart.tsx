type Stage = {
  label: string;
  count: number;
  color: string;
};

const stages: Stage[] = [
  { label: "Novo", count: 214, color: "#3B82F6" },
  { label: "Contato Inicial", count: 178, color: "#8B5CF6" },
  { label: "Qualificação", count: 143, color: "#F59E0B" },
  { label: "Proposta", count: 97, color: "#F97316" },
  { label: "Negociação", count: 61, color: "#EF4444" },
  { label: "Fechamento", count: 38, color: "#10B981" },
];

const max = stages[0].count;

export default function FunnelChart() {
  return (
    <div
      className="rounded-xl p-6 shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>Funil de Conversão</h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Distribuição por etapa</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
          Últimos 30 dias
        </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => {
          const pct = Math.round((stage.count / max) * 100);
          return (
            <div key={stage.label} className="flex items-center gap-4">
              <span className="text-xs font-medium w-28 shrink-0 text-right" style={{ color: "#6B7280" }}>
                {stage.label}
              </span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: "#F1F5F9" }}>
                <div
                  className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                  style={{ width: `${pct}%`, background: stage.color, minWidth: "2.5rem" }}
                >
                  <span className="text-white text-xs font-semibold">{stage.count}</span>
                </div>
              </div>
              <span className="text-xs font-semibold w-10 text-right" style={{ color: "#111827" }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
