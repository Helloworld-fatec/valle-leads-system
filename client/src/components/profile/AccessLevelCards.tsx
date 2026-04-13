import { UserRole, roleLabels, roleColors } from "../../data/mockUsers";
import { Check, X, ShieldCheck, TrendingUp, Headphones } from "lucide-react";

interface Permission {
  label: string;
  manager: boolean;
  seller: boolean;
  attendant: boolean;
}

const permissions: Permission[] = [
  { label: "Ver todos os leads", manager: true, seller: false, attendant: false },
  { label: "Criar leads", manager: true, seller: true, attendant: true },
  { label: "Editar leads próprios", manager: true, seller: true, attendant: true },
  { label: "Editar leads da equipe", manager: true, seller: false, attendant: false },
  { label: "Mover no funil", manager: true, seller: true, attendant: true },
  { label: "Fechar negociação", manager: true, seller: true, attendant: false },
  { label: "Gerenciar usuários", manager: true, seller: false, attendant: false },
  { label: "Acessar relatórios", manager: true, seller: false, attendant: false },
  { label: "Configurar equipes", manager: true, seller: false, attendant: false },
  { label: "Ver logs do sistema", manager: true, seller: false, attendant: false },
];

const roleIcons: Record<UserRole, React.ReactNode> = {
  MANAGER: <ShieldCheck size={18} />,
  SELLER: <TrendingUp size={18} />,
  ATTENDANT: <Headphones size={18} />,
};

const roleDescriptions: Record<UserRole, string> = {
  MANAGER: "Acesso completo ao sistema, equipes e relatórios.",
  SELLER: "Gestão de próprios leads e negociações.",
  ATTENDANT: "Criação e acompanhamento básico de leads.",
};

const rolePermMap: Record<UserRole, keyof Permission> = {
  MANAGER: "manager",
  SELLER: "seller",
  ATTENDANT: "attendant",
};

interface AccessLevelCardsProps {
  currentRole: UserRole;
}

export default function AccessLevelCards({ currentRole }: AccessLevelCardsProps) {
  const roles: UserRole[] = ["MANAGER", "SELLER", "ATTENDANT"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-900">Níveis de acesso</h3>
        <span className="text-xs text-gray-400">permissões por perfil</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roles.map((role) => {
          const { bg, text, dot } = roleColors[role];
          const isCurrentRole = role === currentRole;
          const permKey = rolePermMap[role];

          return (
            <div
              key={role}
              className={`rounded-xl border p-4 transition-all ${
                isCurrentRole
                  ? "border-blue-200 ring-2 ring-blue-100"
                  : "border-gray-100"
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg, color: text }}
                >
                  {roleIcons[role]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900">{roleLabels[role]}</p>
                    {isCurrentRole && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                        você
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                {roleDescriptions[role]}
              </p>

              {/* Permissions list */}
              <div className="space-y-1.5">
                {permissions.map((perm) => {
                  const hasPermission = perm[permKey] as boolean;
                  return (
                    <div
                      key={perm.label}
                      className="flex items-center gap-2"
                    >
                      {hasPermission ? (
                        <Check size={12} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <X size={12} className="text-gray-300 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          hasPermission ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
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
