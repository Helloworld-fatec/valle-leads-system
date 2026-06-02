// src/pages/SalesFunnel.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNegotiationsService } from "../services/negotiationsService";
import KanbanBoard from "../components/sales-funnel/kanbanBoard";
import type { Negotiation } from "../services/negotiationsService";
import { RefreshCw } from "lucide-react";

export default function SalesFunnel() {
  const { user } = useAuth();
  const { getNegotiations } = useNegotiationsService();

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    getNegotiations({ attendant_id: user.id, is_open: true })
      .then((data) => setNegotiations(data))
      .catch(() => setError("Erro ao carregar as negociações. Tente novamente."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function handleRetry() {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    getNegotiations({ attendant_id: user.id, is_open: true })
      .then((data) => setNegotiations(data))
      .catch(() => setError("Erro ao carregar as negociações. Tente novamente."))
      .finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#2563EB,#6366F1)" }}
          >
            <RefreshCw size={18} className="text-white animate-spin" />
          </div>
          <span className="text-sm text-slate-500 font-medium">Carregando funil de vendas…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div
          className="text-center px-6 py-5 rounded-2xl"
          style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5" }}
        >
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-3 flex items-center gap-1.5 mx-auto text-sm text-red-600 font-semibold hover:text-red-800 transition-colors"
          >
            <RefreshCw size={13} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 flex flex-col gap-6"
      style={{ background: "linear-gradient(160deg,#F8FAFC 0%,#F1F5F9 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Funil de Vendas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {negotiations.length} negociação{negotiations.length !== 1 ? "s" : ""} ativa
            {negotiations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Board */}
      {negotiations.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "#EFF6FF" }}
          >
            <RefreshCw size={24} className="text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Nenhuma negociação encontrada.</p>
        </div>
      ) : (
        <KanbanBoard negotiations={negotiations} onUpdate={setNegotiations} />
      )}
    </div>
  );
}