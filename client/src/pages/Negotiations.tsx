// src/pages/Negotiations.tsx
import KanbanColumn from "../components/negotiations/KanbanColumn";
import PipelineTopBar from "../components/negotiations/PipelineTopBar";
import { Lead } from "../components/negotiations/LeadCard";
import { Plus, SlidersHorizontal } from "lucide-react";

// NegotiationStage values used as stageKey
const stages: { stageKey: any; label: string; color: string; bg: string }[] = [
  { stageKey: "contato_inicial",      label: "Contato Inicial",  color: "#6366F1", bg: "#EEF2FF" },
  { stageKey: "qualificacao",         label: "Qualificação",     color: "#F59E0B", bg: "#FFFBEB" },
  { stageKey: "visita",               label: "Visita",           color: "#3B82F6", bg: "#EFF6FF" },
  { stageKey: "proposta",             label: "Proposta",         color: "#8B5CF6", bg: "#F5F3FF" },
  { stageKey: "negociacao",           label: "Negociação",       color: "#F97316", bg: "#FFF7ED" },
  { stageKey: "fechamento_com_venda", label: "Fechado c/ Venda", color: "#10B981", bg: "#ECFDF5" },
  { stageKey: "fechamento_sem_venda", label: "Fechado s/ Venda", color: "#EF4444", bg: "#FEF2F2" },
];

const mockLeads: Record<string, Lead[]> = {
  contato_inicial: [
    { id: "a1", name: "Fernanda Castro",   email: "fcastro@email.com",      phone: "(11) 99201-4432", value: "R$ 62.000",  rawValue: 62000,  importance: "morno",  source: "Instagram", attendant: "Suelen Valle" },
    { id: "a2", name: "Paulo Teixeira",    email: "p.teixeira@gmail.com",   phone: "(11) 98877-3310", value: "R$ 48.000",  rawValue: 48000,  importance: "frio",   source: "Google",    attendant: "Rafael Melo"  },
    { id: "a3", name: "Camila Nogueira",   email: "camila.n@email.com",     phone: "(11) 97654-0021", value: "R$ 95.000",  rawValue: 95000,  importance: "quente", source: "Indicação", attendant: "Ana Souza"    },
  ],
  qualificacao: [
    { id: "b1", name: "Juliana Rocha",     email: "ju.rocha@email.com",     phone: "(21) 99341-5521", value: "R$ 38.000",  rawValue: 38000,  importance: "morno",  source: "Indicação", attendant: "Suelen Valle" },
    { id: "b2", name: "Diego Almeida",     email: "diego.a@empresa.com",    phone: "(11) 98765-4432", value: "R$ 71.000",  rawValue: 71000,  importance: "quente", source: "WhatsApp",  attendant: "Rafael Melo"  },
  ],
  visita: [
    { id: "c1", name: "Roberto Souza",     email: "roberto@empresa.com",    phone: "(11) 99201-3344", value: "R$ 45.000",  rawValue: 45000,  importance: "morno",  source: "Site",      attendant: "Ana Souza"    },
    { id: "c2", name: "Patrícia Lima",     email: "p.lima@email.com",       phone: "(11) 98712-0099", value: "R$ 130.000", rawValue: 130000, importance: "quente", source: "Indicação", attendant: "Suelen Valle" },
    { id: "c3", name: "Lucas Ferreira",    email: "lferreira@gmail.com",    phone: "(21) 97890-3312", value: "R$ 55.000",  rawValue: 55000,  importance: "frio",   source: "Google",    attendant: "Rafael Melo"  },
  ],
  proposta: [
    { id: "d1", name: "Carlos Mendes",     email: "carlos@email.com",       phone: "(11) 99021-4411", value: "R$ 85.000",  rawValue: 85000,  importance: "quente", source: "Indicação", attendant: "Suelen Valle" },
    { id: "d2", name: "Tatiane Oliveira",  email: "tati.oli@email.com",     phone: "(11) 98001-2233", value: "R$ 160.000", rawValue: 160000, importance: "quente", source: "Site",      attendant: "Ana Souza"    },
  ],
  negociacao: [
    { id: "e1", name: "Ana Beatriz Lima",  email: "ana.lima@gmail.com",     phone: "(11) 97001-5544", value: "R$ 120.000", rawValue: 120000, importance: "quente", source: "WhatsApp",  attendant: "Suelen Valle" },
    { id: "e2", name: "Henrique Costa",    email: "h.costa@empresa.com",    phone: "(11) 99345-7712", value: "R$ 89.000",  rawValue: 89000,  importance: "morno",  source: "Instagram", attendant: "Rafael Melo"  },
  ],
  fechamento_com_venda: [
    { id: "f1", name: "Marcelo Dias",      email: "marcelo.d@gmail.com",    phone: "(11) 98231-0011", value: "R$ 210.000", rawValue: 210000, importance: "quente", source: "Google",    attendant: "Suelen Valle" },
  ],
  fechamento_sem_venda: [],
};

export default function Negotiations() {
  const allLeads    = Object.values(mockLeads).flat();
  const totalRaw    = allLeads.reduce((acc, l) => acc + l.rawValue, 0);
  const totalFormatted = `R$ ${(totalRaw / 1_000_000).toFixed(1)}M`;

  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ background: "linear-gradient(160deg,#F8FAFC 0%,#F1F5F9 100%)" }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Negociações</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe e mova leads pelo funil de vendas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-white hover:shadow-sm"
            style={{ border: "1.5px solid #E2E8F0", background: "#fff" }}
          >
            <SlidersHorizontal size={15} />
            Filtros
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#2563EB,#6366F1)" }}
          >
            <Plus size={15} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Top summary */}
      <PipelineTopBar
        totalValue={totalFormatted}
        activeLeads={allLeads.length}
        closedThisMonth={1}
      />

      {/* Kanban board */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-3.5" style={{ minWidth: "max-content" }}>
          {stages.map(({ stageKey, label, color, bg }) => (
            <KanbanColumn
              key={stageKey}
              stageKey={stageKey}
              label={label}
              color={color}
              bg={bg}
              leads={mockLeads[stageKey] ?? []}
              isClosed={stageKey === "fechamento_com_venda" || stageKey === "fechamento_sem_venda"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}