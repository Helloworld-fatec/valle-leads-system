// src/components/profile/ProfileHeader.tsx
import { Camera, CheckCircle2 } from "lucide-react";
import type { UserProfile, UserRole } from "../../services/profileService";

// ─────────────────────────────────────────────
// Sistema de cores por role
// ─────────────────────────────────────────────

interface RoleStyle {
  bg: string;
  text: string;
  dot: string;
  banner: string;
}

const roleStyles: Record<string, RoleStyle> = {
  ATTENDANT: {
    bg:     "#EFF6FF",
    text:   "#1D4ED8",
    dot:    "#3B82F6",
    banner: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)",
  },
  MANAGER: {
    bg:     "#F0FDF4",
    text:   "#166534",
    dot:    "#22C55E",
    banner: "linear-gradient(135deg, #052E16 0%, #14532D 50%, #16A34A 100%)",
  },
  GENERAL_MANAGER: {
    bg:     "#FAF5FF",
    text:   "#6B21A8",
    dot:    "#A855F7",
    banner: "linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #7C3AED 100%)",
  },
  ADMIN: {
    bg:     "#EFF6FF",
    text:   "#1D4ED8",
    dot:    "#3B82F6",
    banner: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)",
  },
};

const roleLabels: Record<string, string> = {
  ATTENDANT:       "Atendente",
  MANAGER:         "Gerente",
  GENERAL_MANAGER: "Gerente Geral",
  ADMIN:           "Administrador",
};

const fallbackStyle: RoleStyle = roleStyles.ADMIN;

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ProfileHeaderProps {
  profile: UserProfile;
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const style = roleStyles[profile.role] ?? fallbackStyle;
  const label = roleLabels[profile.role] ?? profile.role;
  const teamName = profile.user_teams?.[0]?.team?.name ?? "Sem equipe";

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Banner — cor muda conforme o role */}
      <div
        className="h-28 w-full relative"
        style={{ background: style.banner }}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 right-24 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute top-4 left-1/3 w-10 h-10 rounded-full bg-white/5" />
      </div>

      {/* Avatar + info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
          {/* Avatar */}
          <div className="relative w-fit">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: style.bg, color: style.text }}
            >
              {getInitials(profile.name)}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
              title="Alterar foto"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <CheckCircle2 size={12} />
              Conta ativa
            </span>
          </div>
        </div>

        {/* Nome + role + time */}
        <div className="mt-3">
          <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: style.bg, color: style.text }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: style.dot }}
              />
              {label}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{teamName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">Membro desde {memberSince}</span>
          </div>
        </div>
      </div>
    </div>
  );
}