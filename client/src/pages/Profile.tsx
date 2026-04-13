import { mockUsers } from "../data/mockUsers";
import ProfileHeader from "../components/profile/ProfileHeader";
import AccountInfo from "../components/profile/AccountInfo";
import EditProfileForm from "../components/profile/EditProfileForm";
import AccessLevelCards from "../components/profile/AccessLevelCards";
import ActivityStats from "../components/profile/ActivityStats";
import DangerZone from "../components/profile/DangerZone";

// Usuário logado simulado = Suelen (MANAGER)
const currentUser = mockUsers[0];

export default function Profile() {
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
        <ProfileHeader user={currentUser} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AccountInfo user={currentUser} />
          <ActivityStats />
          <DangerZone />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <EditProfileForm user={currentUser} />
        </div>
      </div>

      {/* Access levels - full width */}
      <AccessLevelCards currentRole={currentUser.role} />
    </div>
  );
}
