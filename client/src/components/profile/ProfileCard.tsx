type Props = {
  user: any;
};

export default function ProfileCard({ user }: Props) {
  function formatRole(role: string) {
    switch (role) {
      case "ATTENDANT":
        return "Atendente";
      case "MANAGER":
        return "Gerente de Equipe";
      case "GENERAL_MANAGER":
        return "Gerente Geral";
      default:
        return role;
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-4">Informações</h2>

      <p><strong>Nome:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Cargo:</strong> {formatRole(user.role)}</p>
      <p><strong>Equipe:</strong> {user.team_id}</p>
    </div>
  );
}