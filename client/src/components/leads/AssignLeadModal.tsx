import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { useLeadService } from "../../services/leadService";
import type { Lead } from "../../services/leadService";
import { useApi } from "../../services/api";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface Attendant {
  id: string;
  name: string;
  role: string;
}

interface Props {
  leadIds: string[];
  teamId: string;
  onClose: () => void;
  onAssigned: (updatedLead: Lead) => void;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function AssignLeadModal({
  leadIds,
  teamId,
  onClose,
  onAssigned,
}: Props) {
  const { assignLead, bulkAssignLeads } = useLeadService();
  const { apiFetch } = useApi();

  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isBulk = leadIds.length > 1;

  // ── Busca atendentes da equipe ───────────────
  useEffect(() => {
    async function fetchAttendants() {
      try {
        const res = await apiFetch(`/api/users?team_id=${teamId}`);
        const json = await res.json();
        const list = json.data ?? json;
        // Filtra só atendentes
        setAttendants(
          list.filter(
            (u: Attendant) => u.role === "ATTENDANT" || u.role === "ATENDENTE",
          ),
        );
      } catch {
        setError("Erro ao carregar atendentes.");
      } finally {
        setLoadingUsers(false);
      }
    }

    if (teamId) fetchAttendants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // ── Atribuição ───────────────────────────────
  async function handleAssign() {
    if (!selectedId) return;

    try {
      setLoading(true);
      setError(null);

      if (isBulk) {
        const results = await bulkAssignLeads(leadIds, selectedId);
        const failed = results.filter((r) => r.status === "rejected").length;

        if (failed > 0) {
          setError(
            `${leadIds.length - failed} atribuídos. ${failed} falharam.`,
          );
        } else {
          setSuccess(true);
          setTimeout(() => {
            onAssigned({} as Lead);
          }, 1000);
        }
      } else {
        const updated = await assignLead(leadIds[0], selectedId);
        setSuccess(true);
        setTimeout(() => {
          onAssigned(updated);
        }, 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atribuir lead.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
        style={{ background: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "#111827" }}>
              {isBulk ? `Atribuir ${leadIds.length} Leads` : "Atribuir Lead"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
              Selecione um atendente da equipe
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
            style={{ color: "#6B7280" }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">
          {/* Loading atendentes */}
          {loadingUsers && (
            <div className="flex items-center justify-center py-8">
              <Loader2
                size={20}
                className="animate-spin"
                style={{ color: "#2563EB" }}
              />
            </div>
          )}

          {/* Lista de atendentes */}
          {!loadingUsers && attendants.length === 0 && (
            <p
              className="text-sm text-center py-4"
              style={{ color: "#9CA3AF" }}
            >
              Nenhum atendente encontrado nesta equipe.
            </p>
          )}

          {!loadingUsers && attendants.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {attendants.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                  style={{
                    borderColor: selectedId === a.id ? "#2563EB" : "#E5E7EB",
                    background: selectedId === a.id ? "#EFF6FF" : "#FFFFFF",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "#2563EB" }}
                  >
                    {a.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#111827" }}
                  >
                    {a.name}
                  </span>
                  {selectedId === a.id && (
                    <CheckCircle
                      size={16}
                      className="ml-auto"
                      style={{ color: "#2563EB" }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Erro */}
          {error && (
            <div
              className="mt-3 text-xs font-medium px-3 py-2 rounded-lg"
              style={{ background: "#FEF2F2", color: "#DC2626" }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Sucesso */}
          {success && (
            <div
              className="mt-3 text-xs font-medium px-3 py-2 rounded-lg"
              style={{ background: "#DCFCE7", color: "#16A34A" }}
            >
              {isBulk
                ? "Leads atribuídos com sucesso!"
                : "Lead atribuído com sucesso!"}
            </div>
          )}
        </div>{" "}
        {/* fecha body */}
        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex gap-3"
          style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}
        >
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedId || loading || success}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Atribuindo...
              </>
            ) : (
              "Atribuir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
