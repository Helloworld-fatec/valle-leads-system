const pipeline = [
  { stage: "Novo", count: 214, value: "R$ 2,1M", color: "#3B82F6", bg: "#EFF6FF" },
  { stage: "Qualificação", count: 143, value: "R$ 5,8M", color: "#F59E0B", bg: "#FFFBEB" },
  { stage: "Proposta", count: 97, value: "R$ 9,4M", color: "#8B5CF6", bg: "#F5F3FF" },
  { stage: "Negociação", count: 61, value: "R$ 7,2M", color: "#F97316", bg: "#FFF7ED" },
  { stage: "Fechamento", count: 38, value: "R$ 6,1M", color: "#10B981", bg: "#ECFDF5" },
];

export default function PipelineSummary() {
  return (
    <div
      className="rounded-xl p-6 shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="mb-5">
        <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>Pipeline por Etapa</h3>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Volume e valor estimado</p>
      </div>

      <div className="space-y-3">
        {pipeline.map((item) => (
          <div
            key={item.stage}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: item.bg }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-sm font-medium" style={{ color: "#374151" }}>{item.stage}</span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.06)", color: item.color }}
              >
                {item.count} leads
              </span>
              <span className="text-sm font-bold" style={{ color: "#111827" }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "#E5E7EB" }}>
        <span className="text-sm font-medium" style={{ color: "#6B7280" }}>Total em pipeline</span>
        <span className="text-base font-bold" style={{ color: "#2563EB" }}>R$ 30,6M</span>
      </div>
    </div>
  );
}
