// src/pages/Config.tsx
import { useState } from "react";
import {
  UserRoundCog,
  PlusCircle,
  Store,
  Users,
  ShieldOff,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hook/useAuth";
import ManagerLeads from "./ManagerLeads";
import GMLeads from "./GMLeads";
import CreateLead from "./CreateLead";
import Stores from "./Stores";
import Teams from "./Teams";

// ─── Seções disponíveis ───────────────────────────────────────────────────────
type Section = "atribuicao" | "criacao" | "lojas" | "times" | null;

interface ConfigCard {
  id: Section;
  label: string;
  description: string;
  icon: React.ReactNode;
  colorIcon: string;
  colorBg: string;
}

const MANAGER_CARDS: ConfigCard[] = [
  {
    id: "atribuicao",
    label: "Atribuição de Leads",
    description: "Distribua leads entre os atendentes da sua equipe",
    icon: <UserRoundCog size={20} />,
    colorIcon: "text-blue-600 bg-blue-50",
    colorBg: "hover:bg-blue-50/60 border-gray-200 hover:border-blue-200",
  },
  {
    id: "criacao",
    label: "Criação de Leads",
    description: "Cadastre novos leads manualmente no sistema",
    icon: <PlusCircle size={20} />,
    colorIcon: "text-emerald-600 bg-emerald-50",
    colorBg: "hover:bg-emerald-50/60 border-gray-200 hover:border-emerald-200",
  },
];

const GM_EXTRA_CARDS: ConfigCard[] = [
  {
    id: "lojas",
    label: "Configurar Lojas",
    description: "Gerencie as lojas da rede Valle",
    icon: <Store size={20} />,
    colorIcon: "text-purple-600 bg-purple-50",
    colorBg: "hover:bg-purple-50/60 border-gray-200 hover:border-purple-200",
  },
  {
    id: "times",
    label: "Configurar Times",
    description: "Crie e edite equipes por loja",
    icon: <Users size={20} />,
    colorIcon: "text-amber-600 bg-amber-50",
    colorBg: "hover:bg-amber-50/60 border-gray-200 hover:border-amber-200",
  },
];

// ─── Forbidden inline ─────────────────────────────────────────────────────────
function ConfigForbidden() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 min-h-full">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={28} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso restrito</h2>
        <p className="text-sm text-gray-400">
          Você não tem permissão para acessar as configurações. Fale com seu gerente.
        </p>
      </div>
    </div>
  );
}

// ─── Card de opção ────────────────────────────────────────────────────────────
function OptionCard({ card, onClick }: { card: ConfigCard; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 w-full text-left rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-sm ${card.colorBg}`}
    >
      {/* Ícone */}
      <div className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${card.colorIcon} transition-colors`}>
        {card.icon}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 font-semibold text-sm leading-tight">{card.label}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-snug">{card.description}</p>
      </div>

      {/* Chevron */}
      <ChevronRight
        size={16}
        className="shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200"
      />
    </button>
  );
}

// ─── Barra de voltar ──────────────────────────────────────────────────────────
function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Configurações
      </button>
      <span className="text-gray-300">/</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Config() {
  const { user } = useAuth();
  const role = user?.role;
  const [active, setActive] = useState<Section>(null);

  const isGM = role === "GENERAL_MANAGER" || role === "ADMIN";

  // ATTENDANT → forbidden
  if (role === "ATTENDANT") {
    return <ConfigForbidden />;
  }

  // Cards conforme role
  const cards: ConfigCard[] = isGM
    ? [...MANAGER_CARDS, ...GM_EXTRA_CARDS]
    : MANAGER_CARDS;

  // ── Sub-páginas ──────────────────────────────────────────────────────────

  if (active === "atribuicao") {
    return (
      <div className="flex flex-col h-full">
        <BackBar label="Atribuição de Leads" onBack={() => setActive(null)} />
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {isGM ? <GMLeads /> : <ManagerLeads />}
        </div>
      </div>
    );
  }

  if (active === "criacao") {
    return (
      <div className="flex flex-col h-full">
        <BackBar label="Criação de Leads" onBack={() => setActive(null)} />
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <CreateLead />
        </div>
      </div>
    );
  }

  if (active === "lojas") {
    return (
      <div className="flex flex-col h-full">
        <BackBar label="Configurar Lojas" onBack={() => setActive(null)} />
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <Stores />
        </div>
      </div>
    );
  }

  if (active === "times") {
    return (
      <div className="flex flex-col h-full">
        <BackBar label="Configurar Times" onBack={() => setActive(null)} />
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <Teams />
        </div>
      </div>
    );
  }

  // ── Hub de opções ────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-gray-50 p-6 sm:p-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações</h1>
          <p className="mt-1 text-sm text-gray-400">Selecione uma opção para continuar</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-6" />

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <OptionCard key={card.id} card={card} onClick={() => setActive(card.id)} />
          ))}
        </div>

      </div>
    </div>
  );
}