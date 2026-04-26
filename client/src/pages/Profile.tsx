import { useAuth } from "../hooks/useAuth";
import ProfileCard from "../components/profile/ProfileCard";
import EditProfileForm from "../components/profile/EditProfileForm";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Meu Perfil</h1>

      <ProfileCard user={user} />
      <EditProfileForm user={user} />
    </div>
  );
}