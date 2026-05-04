import { roleLabels } from "../../data/mockUsers";
import { Mail, Shield, Hash, Calendar } from "lucide-react";
import type { ProfileUser } from "../../pages/Profile";

interface AccountInfoProps {
  user: ProfileUser;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AccountInfo({ user }: AccountInfoProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold text-gray-900">Informações da conta</h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">somente leitura</span>
      </div>

      <InfoRow
        icon={<Mail size={14} />}
        label="E-mail"
        value={user.email}
      />
      <InfoRow
        icon={<Shield size={14} />}
        label="Perfil de acesso"
        value={roleLabels[user.role]}
      />
      <InfoRow
        icon={<Hash size={14} />}
        label="ID do usuário"
        value={`#${user.id.padStart(6, "0")}`}
      />
      <InfoRow
        icon={<Calendar size={14} />}
        label="Data de cadastro"
        value={new Date(user.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      />
    </div>
  );
}
