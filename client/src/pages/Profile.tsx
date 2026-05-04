import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProfileHeader from "../components/profile/ProfileHeader";
import AccountInfo from "../components/profile/AccountInfo";
import EditProfileForm from "../components/profile/EditProfileForm";
import AccessLevelCards from "../components/profile/AccessLevelCards";
import ActivityStats from "../components/profile/ActivityStats";
import DangerZone from "../components/profile/DangerZone";
import { useAuth } from "../hook/useAuth";
import { useApi } from "../services/api";

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "ATTENDANT";
  is_active: boolean;
  created_at: string;
  team?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiFetch(`/users/${user?.id}`);
        const data = await res.json();
        setProfileUser(data);
      } catch {
        setError("Erro ao carregar perfil. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) fetchUser();
  }, [user, apiFetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-500">{error || "Usuário não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gerencie suas informações e preferências
        </p>
      </div>

      {/* Header card */}
      <div className="mb-6">
        <ProfileHeader user={profileUser} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AccountInfo user={profileUser} />
          <ActivityStats />
          <DangerZone />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <EditProfileForm user={profileUser} />
        </div>
      </div>

      {/* Access levels - full width */}
      <AccessLevelCards currentRole={profileUser.role} />
    </div>
  );
}
