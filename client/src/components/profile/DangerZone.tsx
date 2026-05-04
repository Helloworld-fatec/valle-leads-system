import { LogOut, AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { useApi } from "../../services/api";

export default function DangerZone() {
  const { user, logout } = useAuth();
  const { apiFetch } = useApi();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDeleteAccount() {
    setError("");
    setDeleting(true);
    try {
      const res = await apiFetch(`/users/${user?.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        logout();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao desativar conta.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={15} className="text-red-500" />
        <h3 className="text-sm font-bold text-red-700">Zona de perigo</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
          <div>
            <p className="text-xs font-semibold text-red-800">Sair da sessão</p>
            <p className="text-xs text-red-500 mt-0.5">Encerrar acesso ao sistema</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
          >
            <LogOut size={12} />
            Sair
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-700">Desativar conta</p>
            <p className="text-xs text-gray-400 mt-0.5">Esta ação pode ser revertida pelo gerente</p>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
          {confirming ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirming(false);
                  setError("");
                }}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                Confirmar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
            >
              Desativar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
