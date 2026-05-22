// src/pages/Profile.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hook/useAuth";
import { useProfileService } from "../services/profileService";
import type { UserProfile, UpdateProfileDTO } from "../services/profileService";

import ProfileHeader    from "../components/profile/ProfileHeader";
import AccountInfo      from "../components/profile/AccountInfo";
import EditPasswordForm  from "../components/profile/EditPasswordForm";
import AccessLevelCards from "../components/profile/AccessLevelCards";
import ActivityStats    from "../components/profile/ActivityStats";
import DangerZone       from "../components/profile/DangerZone";
import EditContactModal from "../components/profile/EditContactModal";

// ─────────────────────────────────────────────
// Skeleton de loading
// ─────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────

export default function Profile() {
  const { user }                          = useAuth();
  const { getProfileWithTeam, updateProfile, updatePassword } = useProfileService();

  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);

  // ── Fetch ───────────────────────────────────

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfileWithTeam(user.id);
      setProfile(data);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar perfil.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Handlers ────────────────────────────────

  async function handleUpdateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile> {
    const updated = await updateProfile(userId, data);
    setProfile(updated);
    return updated;
  }

  async function handleUpdatePassword(password: string): Promise<void> {
    if (!user?.id) return;
    await updatePassword(user.id, password);
  }

  // ── Estados da tela ─────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie suas informações e preferências</p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!profile) return null;

  // ── Render principal ─────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie suas informações e preferências</p>
      </div>

      {/* Header */}
      <div className="mb-6">
        <ProfileHeader profile={profile} />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Coluna esquerda */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AccountInfo
            profile={profile}
            onEditContact={() => setIsEditContactOpen(true)}
          />
          <ActivityStats />
          <DangerZone />
        </div>

        {/* Coluna direita */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <EditPasswordForm
            profile={profile}
            onUpdatePassword={handleUpdatePassword}
          />
        </div>
      </div>

      {/* AccessLevelCards — só visível para GENERAL_MANAGER */}
      {user?.role === "GENERAL_MANAGER" && (
        <AccessLevelCards currentRole={profile.role} />
      )}

      {/* Modal de edição de contato e endereço */}
      <EditContactModal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}