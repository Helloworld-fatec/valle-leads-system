import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import { useLeadService } from "../../services/leadService";
import type { Lead } from "../../services/leadService";

interface Props {
  lead: Lead;
}

export default function OpenNegotiationButton({ lead }: Props) {
  const { user } = useAuth();
  const { createNegotiation } = useLeadService();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleClick() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      await createNegotiation({
        lead_id: lead.id,
        attendant_id: user.id,
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
      {/* Erro — aparece acima do botão sem fechar o modal */}
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
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                   rounded-xl text-sm font-semibold text-white transition-all 
                   hover:opacity-90 active:scale-95 disabled:opacity-60 
                   disabled:cursor-not-allowed"
        style={{ background: "#2563EB" }}
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