// src/components/profile/AccessLevelCards.tsx
import { Check, X, ShieldCheck, TrendingUp, Headphones, Crown } from "lucide-react";
import type { UserRole } from "../../services/profileService";

// ─────────────────────────────────────────────
// Permissões
// ─────────────────────────────────────────────

interface Permission {
  label:           string;
  general_manager: boolean;
  manager:         boolean;
  attendant:       boolean;
}

const permissions: Permission[] = [
  { label: "Ver todos os leads",      general_manager: true,  manager: true,  attendant: false },
  { label: "Criar leads",             general_manager: true,  manager: true,  attendant: true  },
  { label: "Editar leads próprios",   general_manager: true,  manager: true,  attendant: true  },
  { label: "Editar leads da equipe",  general_manager: true,  manager: true,  attendant: false },
  { label: "Mover no funil",          general_manager: true,  manager: true,  attendant: true  },
  { label: "Fechar negociação",       general_manager: true,  manager: true,  attendant: false },
  { label: "Gerenciar usuários",      general_manager: true,  manager: true,  attendant: false },
  { label: "Acessar relatórios",      general_manager: true,  manager: true,  attendant: false },
  { label: "Configurar equipes",      general_manager: true,  manager: true,  attendant: false },
  { label: "Ver logs do sistema",     general_manager: true,  manager: false, attendant: false },
  { label: "Gerenciar todas as lojas",general_manager: true,  manager: false, attendant: false },
];

// ─────────────────────────────────────────────
// Metadados por role
// ─────────────────────────────────────────────

const roleLabels: Record<string, string> = {
  GENERAL_MANAGER: "Gerente Geral",
  MANAGER:         "Gerente",
  ATTENDANT:       "Atendente",
};

const roleDescriptions: Record<string, string> = {
  GENERAL_MANAGER: "Acesso total ao sistema, todas as lojas e equipes.",
  MANAGER:         "Acesso completo à equipe, leads e relatórios.",
  ATTENDANT:       "Criação e acompanhamento básico de leads.",
};

interface RoleColors {
  bg: string;
  text: string;
  dot: string;
}

const roleColors: Record<string, RoleColors> = {
  GENERAL_MANAGER: { bg: "#FAF5FF", text: "#6B21A8", dot: "#A855F7" },
  MANAGER:         { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
  ATTENDANT:       { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
};

const roleIcons: Record<string, React.ReactNode> = {
  GENERAL_MANAGER: <Crown size={18} />,
  MANAGER:         <ShieldCheck size={18} />,
  ATTENDANT:       <Headphones size={18} />,
};

const rolePermMap: Record<string, keyof Permission> = {
  GENERAL_MANAGER: "general_manager",
  MANAGER:         "manager",
  ATTENDANT:       "attendant",
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface AccessLevelCardsProps {
  currentRole: UserRole;
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export default function AccessLevelCards({ currentRole }: AccessLevelCardsProps) {
  const roles: UserRole[] = ["GENERAL_MANAGER", "MANAGER", "ATTENDANT"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-900">Níveis de acesso</h3>
        <span className="text-xs text-gray-400">permissões por perfil</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roles.map((role) => {
          const { bg, text }  = roleColors[role];
          const isCurrentRole = role === currentRole;
          const permKey       = rolePermMap[role];

          return (
            <div
              key={role}
              className={`rounded-xl border p-4 transition-all ${
                isCurrentRole
                  ? "border-blue-200 ring-2 ring-blue-100"
                  : "border-gray-100"
              }`}
            >
              {/* Cabeçalho do card */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: bg, color: text }}
                >
                  {roleIcons[role]}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-gray-900">{roleLabels[role]}</p>
                  {isCurrentRole && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                      você
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                {roleDescriptions[role]}
              </p>

              {/* Lista de permissões */}
              <div className="space-y-1.5">
                {permissions.map((perm) => {
                  const hasPermission = perm[permKey] as boolean;
                  return (
                    <div key={perm.label} className="flex items-center gap-2">
                      {hasPermission ? (
                        <Check size={12} className="text-green-500 shrink-0" />
                      ) : (
                        <X size={12} className="text-gray-300 shrink-0" />
                      )}
                      <span className={`text-xs ${hasPermission ? "text-gray-700" : "text-gray-300"}`}>
                        {perm.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}