import { Search, SlidersHorizontal } from "lucide-react";
import { UserRole, roleLabels } from "../../data/mockUsers";

interface UserFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: UserRole | "ALL";
  onRoleChange: (v: UserRole | "ALL") => void;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  onStatusChange: (v: "ALL" | "ACTIVE" | "INACTIVE") => void;
}

const roles: (UserRole | "ALL")[] = ["ALL", "MANAGER", "SELLER", "ATTENDANT"];
const roleFilterLabels: Record<UserRole | "ALL", string> = {
  ALL: "Todos os perfis",
  ...roleLabels,
};

export default function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
        />
      </div>

      {/* Role filter */}
      <div className="relative">
        <SlidersHorizontal
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value as UserRole | "ALL")}
          className="pl-8 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleFilterLabels[r]}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-4 py-2.5 text-sm font-medium transition-all ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {s === "ALL" ? "Todos" : s === "ACTIVE" ? "Ativos" : "Inativos"}
          </button>
        ))}
      </div>
    </div>
  );
}
