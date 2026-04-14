export type UserRole = "MANAGER" | "SELLER" | "ATTENDANT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  team: string;
  phone?: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Suelen Martins",
    email: "suelen.martins@valleleads.com",
    role: "MANAGER",
    is_active: true,
    created_at: "2024-01-10",
    team: "Equipe Alpha",
    phone: "(11) 98765-4321",
  },
  {
    id: "2",
    name: "Rafael Oliveira",
    email: "rafael.oliveira@valleleads.com",
    role: "SELLER",
    is_active: true,
    created_at: "2024-02-15",
    team: "Equipe Alpha",
    phone: "(11) 91234-5678",
  },
  {
    id: "3",
    name: "Camila Souza",
    email: "camila.souza@valleleads.com",
    role: "SELLER",
    is_active: true,
    created_at: "2024-02-20",
    team: "Equipe Beta",
    phone: "(11) 93456-7890",
  },
  {
    id: "4",
    name: "Lucas Ferreira",
    email: "lucas.ferreira@valleleads.com",
    role: "ATTENDANT",
    is_active: true,
    created_at: "2024-03-01",
    team: "Equipe Beta",
    phone: "(11) 94567-8901",
  },
  {
    id: "5",
    name: "Beatriz Lima",
    email: "beatriz.lima@valleleads.com",
    role: "ATTENDANT",
    is_active: false,
    created_at: "2024-03-10",
    team: "Equipe Gamma",
    phone: "(11) 95678-9012",
  },
  {
    id: "6",
    name: "Thiago Costa",
    email: "thiago.costa@valleleads.com",
    role: "MANAGER",
    is_active: true,
    created_at: "2024-01-20",
    team: "Equipe Gamma",
    phone: "(11) 96789-0123",
  },
  {
    id: "7",
    name: "Amanda Rocha",
    email: "amanda.rocha@valleleads.com",
    role: "SELLER",
    is_active: true,
    created_at: "2024-04-05",
    team: "Equipe Alpha",
    phone: "(11) 97890-1234",
  },
  {
    id: "8",
    name: "Felipe Santos",
    email: "felipe.santos@valleleads.com",
    role: "ATTENDANT",
    is_active: true,
    created_at: "2024-04-12",
    team: "Equipe Beta",
    phone: "(11) 98901-2345",
  },
  {
    id: "9",
    name: "Natália Pereira",
    email: "natalia.pereira@valleleads.com",
    role: "SELLER",
    is_active: false,
    created_at: "2024-05-01",
    team: "Equipe Gamma",
    phone: "(11) 99012-3456",
  },
  {
    id: "10",
    name: "Rodrigo Almeida",
    email: "rodrigo.almeida@valleleads.com",
    role: "ATTENDANT",
    is_active: true,
    created_at: "2024-05-15",
    team: "Equipe Alpha",
    phone: "(11) 90123-4567",
  },
];

export const roleLabels: Record<UserRole, string> = {
  MANAGER: "Gerente",
  SELLER: "Vendedor",
  ATTENDANT: "Atendente",
};

export const roleColors: Record<UserRole, { bg: string; text: string; dot: string }> = {
  MANAGER: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#2563EB" },
  SELLER: { bg: "#F0FDF4", text: "#15803D", dot: "#10B981" },
  ATTENDANT: { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
};
