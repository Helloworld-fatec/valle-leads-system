import { UserRole, roleLabels, roleColors } from "../../data/mockUsers";
import { Check, X, ShieldCheck, Shield, Headphones } from "lucide-react";

interface Permission {
  label: string;
  admin: boolean;
  manager: boolean;
  attendant: boolean;
}

const permissions: Permission[] = [
  { label: "Ver todos os leads", admin: true, manager: true, attendant: false },
  { label: "Criar leads", admin: true, manager: true, attendant: true },
  { label: "Editar leads próprios", admin: true, manager: true, attendant: true },
  { label: "Editar leads da equipe", admin: true, manager: true, attendant: false },
  { label: "Mover no funil", admin: true, manager: true, attendant: true },
  { label: "Fechar negociação", admin: true, manager: true, attendant: false },
  { label: "Gerenciar usuários", admin: true, manager: true, attendant: false },
  { label: "Acessar relatórios", admin: true, manager: true, attendant: false },
  { label: "Configurar equipes", admin: true, manager: true, attendant: false },
  { label: "Ver logs do sistema", admin: true, manager: true, attendant: false },
];

const roleIcons: Record<UserRole, React.ReactNode> = {
  ADMIN: <Shield size={18} />,
  MANAGER: <ShieldCheck size={18} />,
  ATTENDANT: <Headphones size={18} />,
};

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: "Acesso completo ao sistema como administrador.",
  MANAGER: "Acesso completo ao sistema, equipes e relatórios.",
  ATTENDANT: "Criação e acompanhamento básico de leads.",
};

const rolePermMap: Record<UserRole, keyof Permission> = {
  ADMIN: "admin",
  MANAGER: "manager",
  ATTENDANT: "attendant",
};

interface AccessLevelCardsProps {
  currentRole: UserRole;
}

export default function AccessLevelCards({ currentRole }: AccessLevelCardsProps) {
  const roles: UserRole[] = ["ADMIN", "MANAGER", "ATTENDANT"];

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
