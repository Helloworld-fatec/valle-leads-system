import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  Users as UsersIcon,
} from "lucide-react";

import { useUserService, User, UserRole } from "../services/userService";
import { useAuth } from "../hook/useAuth";

import UserStatsCards from "../components/users/UserStatsCards";
import UserFilters    from "../components/users/UserFilters";
import UserCard       from "../components/users/UserCard";
import UserListRow    from "../components/users/UserListRow";
import InviteUserModal from "../components/users/InviteUserModal";

type ViewMode = "grid" | "list";

// ─── Skeleton de card (grid) ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-gray-100" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-32 bg-gray-100 rounded" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
        <div className="pt-4 border-t border-gray-50 flex justify-between">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-5 w-14 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton de row (lista) ──────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="h-3.5 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="h-3.5 w-28 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </td>
      <td className="px-4 py-3.5" />
    </tr>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Users() {
  const { getUsers, deleteUser } = useUserService();
  const { user: authUser }       = useAuth();

  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [viewMode, setViewMode]         = useState<ViewMode>("grid");
  const [showModal, setShowModal]       = useState(false);

  // Ref para manter referência estável ao service
  const getUsersRef = useRef(getUsers);
  getUsersRef.current = getUsers;

  // Busca todos os usuários (sem paginação exposta — pageSize alto)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsersRef.current({ pageSize: 500 });
      setUsers(result.data ?? []);
    } catch {
      setError("Não foi possível carregar os usuários. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ─── Filtro client-side ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.user_teams as any[])?.some(
          (ut: any) => ut.team?.name?.toLowerCase().includes(q)
        );

      const matchRole   = roleFilter   === "ALL" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE"   && u.is_active) ||
        (statusFilter === "INACTIVE" && !u.is_active);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // ─── Desativar usuário (soft delete) ────────────────────────────────────
  const handleDeactivate = useCallback(
    async (id: string) => {
      try {
        await deleteUser(id);
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_active: false } : u))
        );
      } catch {
        // Mantém o estado; um toast pode ser adicionado aqui futuramente
      }
    },
    [deleteUser]
  );

  const isAdmin = authUser?.role === "ADMIN";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      {/* Cabeçalho da página */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os membros e permissões da equipe
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão recarregar */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            title="Recarregar"
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Toggle de visualização */}
          <div className="flex border border-gray-200 rounded-xl bg-white overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2.5 transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2.5 transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Botão novo usuário — apenas ADMIN */}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-200"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Novo Usuário</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <UserStatsCards users={users} loading={loading} />
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <UserFilters
          search={search}
          onSearchChange={setSearch}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </motion.div>

      {/* Resumo de resultados */}
      {!loading && !error && (
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} usuário{filtered.length !== 1 ? "s" : ""} encontrado
          {filtered.length !== 1 ? "s" : ""}
          {users.length !== filtered.length && ` de ${users.length} no total`}
        </p>
      )}

      {/* Estado de erro */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Erro ao carregar</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">{error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </motion.div>
      )}

      {/* Conteúdo principal */}
      {!error && (
        <>
          {/* Grid skeleton */}
          {loading && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* List skeleton */}
          {loading && viewMode === "list" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Equipe</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Telefone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          )}

          {/* Vazio após filtros */}
          {!loading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <UsersIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold">
                Nenhum usuário encontrado
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Tente ajustar os filtros de busca
              </p>
              {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </motion.div>
          )}

          {/* Grid de cards */}
          {!loading && filtered.length > 0 && viewMode === "grid" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {filtered.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <UserCard user={user} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tabela / lista */}
          {!loading && filtered.length > 0 && viewMode === "list" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Usuário
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Perfil
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      Equipe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      Telefone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <UserListRow
                      key={user.id}
                      user={user}
                      onDeactivate={isAdmin ? handleDeactivate : undefined}
                    />
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}

      {/* Modal de criação */}
      <AnimatePresence>
        {showModal && (
          <InviteUserModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchUsers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
