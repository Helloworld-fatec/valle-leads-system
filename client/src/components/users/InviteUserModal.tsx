import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useUserService, UserRole, CreateUserDTO } from "../../services/userService";
import { useTeamsService, Team } from "../../services/teamService";
import { roleLabels } from "../../constants/userConstants";

interface InviteUserModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const CREATABLE_ROLES: UserRole[] = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

const INITIAL_FORM = {
  name:        "",
  email:       "",
  password:    "",
  role:        "ATTENDANT" as UserRole,
  team_ids:    [] as string[],
  phone_ddd:   "",
  phone_num:   "",
};

export default function InviteUserModal({ onClose, onSuccess }: InviteUserModalProps) {
  const { createUser }  = useUserService();
  const { getTeams }    = useTeamsService();

  const [form, setForm]         = useState(INITIAL_FORM);
  const [status, setStatus]     = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [teams, setTeams]           = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Busca times reais do banco na abertura do modal
  useEffect(() => {
    let cancelled = false;
    setTeamsLoading(true);

    getTeams()
      .then((data) => {
        if (!cancelled) {
          setTeams(data.filter((t) => t.is_active));
        }
      })
      .catch(() => {
        if (!cancelled) setTeams([]);
      })
      .finally(() => {
        if (!cancelled) setTeamsLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTeam(teamId: string) {
    setForm((prev) => ({
      ...prev,
      team_ids: prev.team_ids.includes(teamId)
        ? prev.team_ids.filter((id) => id !== teamId)
        : [...prev.team_ids, teamId],
    }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMsg("Nome, e-mail e senha são obrigatórios.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const dto: CreateUserDTO = {
      name:     form.name.trim(),
      email:    form.email.trim(),
      password: form.password,
      role:     form.role,
      ...(form.team_ids.length > 0 && { team_ids: form.team_ids }),
      ...(form.phone_ddd && form.phone_num && {
        phone_1_ddd:    form.phone_ddd,
        phone_1_number: form.phone_num,
      }),
    };

    try {
      await createUser(dto);
      setStatus("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.message?.includes("409") || err?.message?.toLowerCase().includes("conflict")
          ? "Já existe um usuário com este e-mail."
          : err?.message || "Erro ao criar usuário. Tente novamente.";
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Novo Usuário</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Adicione um membro à equipe
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <p className="text-base font-semibold text-gray-900">
              Usuário criado com sucesso!
            </p>
            <p className="text-sm text-gray-500">
              A lista será atualizada em instantes.
            </p>
          </div>
        ) : (
          <>
            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Nome completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all disabled:opacity-60"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="joao@empresa.com"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all disabled:opacity-60"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Senha <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Perfil */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Perfil <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as UserRole })
                  }
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700 disabled:opacity-60"
                >
                  {CREATABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Telefone (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.phone_ddd}
                    onChange={(e) =>
                      setForm({ ...form, phone_ddd: e.target.value.replace(/\D/g, "").slice(0, 2) })
                    }
                    placeholder="DDD"
                    disabled={isLoading}
                    className="w-20 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-center disabled:opacity-60"
                  />
                  <input
                    type="text"
                    value={form.phone_num}
                    onChange={(e) =>
                      setForm({ ...form, phone_num: e.target.value.replace(/\D/g, "").slice(0, 9) })
                    }
                    placeholder="9xxxx-xxxx"
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Times */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Equipe(s) (opcional)
                </label>
                {teamsLoading ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    Carregando equipes...
                  </div>
                ) : teams.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">
                    Nenhuma equipe ativa encontrada.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {teams.map((team) => {
                      const selected = form.team_ids.includes(team.id);
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => toggleTeam(team.id)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {team.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Erro */}
              {status === "error" && errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex gap-3 shrink-0 border-t border-gray-50">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar usuário"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
