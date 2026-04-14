import KanbanColumn from "../components/negotiations/KanbanColumn";
import PipelineTopBar from "../components/negotiations/PipelineTopBar";
import { Lead } from "../components/negotiations/LeadCard";

const stages = [
  { stage: "Novo", color: "#3B82F6", bg: "#EFF6FF" },
  { stage: "Contato Inicial", color: "#8B5CF6", bg: "#F5F3FF" },
  { stage: "Qualificação", color: "#F59E0B", bg: "#FFFBEB" },
  { stage: "Proposta", color: "#F97316", bg: "#FFF7ED" },
  { stage: "Negociação", color: "#EF4444", bg: "#FEF2F2" },
  { stage: "Fechamento", color: "#10B981", bg: "#ECFDF5" },
];

const mockLeads: Record<string, Lead[]> = {
  "Novo": [
    { id: "a1", name: "Fernanda Castro", email: "fcastro@email.com", phone: "(11) 99201-4432", value: "R$ 62.000", rawValue: 62000, importance: "morno", source: "Instagram", attendant: "Suelen Valle" },
    { id: "a2", name: "Paulo Teixeira", email: "p.teixeira@gmail.com", phone: "(11) 98877-3310", value: "R$ 48.000", rawValue: 48000, importance: "frio", source: "Google", attendant: "Rafael Melo" },
    { id: "a3", name: "Camila Nogueira", email: "camila.n@email.com", phone: "(11) 97654-0021", value: "R$ 95.000", rawValue: 95000, importance: "quente", source: "Indicação", attendant: "Ana Souza" },
  ],
  "Contato Inicial": [
    { id: "b1", name: "Juliana Rocha", email: "ju.rocha@email.com", phone: "(21) 99341-5521", value: "R$ 38.000", rawValue: 38000, importance: "morno", source: "Indicação", attendant: "Suelen Valle" },
    { id: "b2", name: "Diego Almeida", email: "diego.a@empresa.com", phone: "(11) 98765-4432", value: "R$ 71.000", rawValue: 71000, importance: "quente", source: "WhatsApp", attendant: "Rafael Melo" },
  ],
  "Qualificação": [
    { id: "c1", name: "Roberto Souza", email: "roberto@empresa.com", phone: "(11) 99201-3344", value: "R$ 45.000", rawValue: 45000, importance: "morno", source: "Site", attendant: "Ana Souza" },
    { id: "c2", name: "Patrícia Lima", email: "p.lima@email.com", phone: "(11) 98712-0099", value: "R$ 130.000", rawValue: 130000, importance: "quente", source: "Indicação", attendant: "Suelen Valle" },
    { id: "c3", name: "Lucas Ferreira", email: "lferreira@gmail.com", phone: "(21) 97890-3312", value: "R$ 55.000", rawValue: 55000, importance: "frio", source: "Google", attendant: "Rafael Melo" },
  ],
  "Proposta": [
    { id: "d1", name: "Carlos Mendes", email: "carlos@email.com", phone: "(11) 99021-4411", value: "R$ 85.000", rawValue: 85000, importance: "quente", source: "Indicação", attendant: "Suelen Valle" },
    { id: "d2", name: "Tatiane Oliveira", email: "tati.oli@email.com", phone: "(11) 98001-2233", value: "R$ 160.000", rawValue: 160000, importance: "quente", source: "Site", attendant: "Ana Souza" },
  ],
  "Negociação": [
    { id: "e1", name: "Ana Beatriz Lima", email: "ana.lima@gmail.com", phone: "(11) 97001-5544", value: "R$ 120.000", rawValue: 120000, importance: "quente", source: "WhatsApp", attendant: "Suelen Valle" },
    { id: "e2", name: "Henrique Costa", email: "h.costa@empresa.com", phone: "(11) 99345-7712", value: "R$ 89.000", rawValue: 89000, importance: "morno", source: "Instagram", attendant: "Rafael Melo" },
  ],
  "Fechamento": [
    { id: "f1", name: "Marcelo Dias", email: "marcelo.d@gmail.com", phone: "(11) 98231-0011", value: "R$ 210.000", rawValue: 210000, importance: "quente", source: "Google", attendant: "Suelen Valle" },
  ],
};

export default function Negotiations() {
  const allLeads = Object.values(mockLeads).flat();
  const totalRaw = allLeads.reduce((acc, l) => acc + l.rawValue, 0);
  const totalFormatted = `R$ ${(totalRaw / 1_000_000).toFixed(1)}M`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Negociações</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Acompanhe e mova leads pelo funil de vendas
          </p>
        </div>
        <button
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#2563EB" }}
        >
          + Novo Lead
        </button>
      </div>

      {/* Top summary */}
      <PipelineTopBar
        totalValue={totalFormatted}
        activeLeads={allLeads.length}
        closedThisMonth={1}
      />

      {/* Kanban board */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {stages.map(({ stage, color, bg }) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              color={color}
              bg={bg}
              leads={mockLeads[stage] ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
