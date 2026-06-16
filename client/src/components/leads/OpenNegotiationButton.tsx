import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import { useLeadService } from "../../services/leadService";
import type { Lead } from "../../services/leadService";

interface Props {
  lead: Lead;
}

const CLOSED_STATUSES: Lead["status"][] = ["won", "lost"];

export default function OpenNegotiationButton({ lead }: Props) {
  const { user } = useAuth();
  const { createNegotiation } = useLeadService();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamId = lead.team_id ?? undefined;
  const isClosed = CLOSED_STATUSES.includes(lead.status);
  const isDisabled = loading || isClosed || !teamId;

  async function handleClick() {
    if (!user?.id || isDisabled || !teamId) return;

    try {
      setLoading(true);
      setError(null);

      await createNegotiation({
        lead_id: lead.id,
        team_id: teamId,
      });

      navigate("/funil");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao abrir negociação.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {isClosed && (
        <div
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg"
          style={{ background: "#F3F4F6", color: "#6B7280" }}
        >
          <AlertCircle size={13} />
          Lead encerrado — não é possível abrir negociação.
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg"
          style={{ background: "#FEF2F2", color: "#DC2626" }}
        >
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={isDisabled}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Abrindo negociação...
          </>
        ) : (
          <>
            Abrir no Funil
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
}
