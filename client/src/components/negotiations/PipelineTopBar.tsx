type Props = {
  totalValue: string;
  activeLeads: number;
  closedThisMonth: number;
};

export default function PipelineTopBar({ totalValue, activeLeads, closedThisMonth }: Props) {
  return (
    <div className="flex items-center gap-4 flex-wrap mb-6">
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm"
        style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div>
          <p className="text-xs" style={{ color: "#6B7280" }}>Total em Pipeline</p>
          <p className="text-lg font-bold" style={{ color: "#2563EB" }}>{totalValue}</p>
        </div>
      </div>

      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm"
        style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div>
          <p className="text-xs" style={{ color: "#6B7280" }}>Leads Ativos</p>
          <p className="text-lg font-bold" style={{ color: "#111827" }}>{activeLeads}</p>
        </div>
      </div>

      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm"
        style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div>
          <p className="text-xs" style={{ color: "#6B7280" }}>Fechados este mês</p>
          <p className="text-lg font-bold" style={{ color: "#10B981" }}>{closedThisMonth}</p>
        </div>
      </div>
    </div>
  );
}
