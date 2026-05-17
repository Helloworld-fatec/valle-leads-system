// src/components/profile/AccountInfo.tsx
import { Mail, Shield, Hash, Calendar, Phone, MapPin, Pencil } from "lucide-react";
import type { UserProfile } from "../../services/profileService";

// ─────────────────────────────────────────────
// Labels de role — compatível com AuthContext.tsx
// ─────────────────────────────────────────────

const roleLabels: Record<string, string> = {
  ATTENDANT:       "Atendente",
  MANAGER:         "Gerente",
  GENERAL_MANAGER: "Gerente Geral",
  ADMIN:           "Administrador",
};

// ─────────────────────────────────────────────
// Componente interno InfoRow
// ─────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Helpers de formatação
// ─────────────────────────────────────────────

function formatPhone(ddd: string | null | undefined, number: string | null | undefined): string {
  if (!ddd && !number) return "Não informado";
  if (ddd && number)   return `(${ddd}) ${number}`;
  if (number)          return number;
  return "Não informado";
}

function formatAddress(profile: UserProfile): string {
  const { address_street, address_number, address_complement, address_neighborhood, address_city, address_state } = profile;

  if (!address_street && !address_city) return "Não informado";

  const parts: string[] = [];

  if (address_street) {
    let line = address_street;
    if (address_number)     line += `, Nº ${address_number}`;
    if (address_complement) line += `, ${address_complement}`;
    parts.push(line);
  }

  const cityLine = [address_neighborhood, [address_city, address_state].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(", ");

  if (cityLine) parts.push(cityLine);

  return parts.join(" — ");
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface AccountInfoProps {
  profile: UserProfile;
  onEditContact: () => void;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AccountInfo({ profile, onEditContact }: AccountInfoProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">Informações da conta</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            somente leitura
          </span>
        </div>
        <button
          onClick={onEditContact}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Pencil size={11} />
          Editar
        </button>
      </div>

      {/* Linhas fixas */}
      <InfoRow
        icon={<Mail size={14} />}
        label="E-mail"
        value={profile.email}
      />
      <InfoRow
        icon={<Shield size={14} />}
        label="Perfil de acesso"
        value={roleLabels[profile.role] ?? profile.role}
      />
      <InfoRow
        icon={<Hash size={14} />}
        label="ID do usuário"
        value={`#${profile.id.slice(0, 8).toUpperCase()}`}
      />
      <InfoRow
        icon={<Calendar size={14} />}
        label="Data de cadastro"
        value={
          profile.created_at
            ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "—"
        }
      />

      {/* Linhas de contato */}
      <InfoRow
        icon={<Phone size={14} />}
        label="Telefone 1"
        value={formatPhone(profile.phone_1_ddd, profile.phone_1_number)}
      />
      <InfoRow
        icon={<Phone size={14} />}
        label="Telefone 2"
        value={formatPhone(profile.phone_2_ddd, profile.phone_2_number)}
      />
      <InfoRow
        icon={<MapPin size={14} />}
        label="Endereço"
        value={formatAddress(profile)}
      />
    </div>
  );
}