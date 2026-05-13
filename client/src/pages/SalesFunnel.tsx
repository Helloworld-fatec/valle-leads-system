import { useEffect, useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNegotiationsService } from "../services/negotiationsService";
import KanbanBoard from "../components/sales-funnel/kanbanBoard";
import type { Negotiation } from "../types/negotiations";

export default function SalesFunnel() {
    const {user} = useAuth();
    const {getNegotiations} = useNegotiationsService();
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        getNegotiations(user.id)
        .then((res) => setNegotiations(res.data ?? []))
        .catch(() => setError("Erro ao carregar as negociações. Tente novamente."))
        .finally(() => setLoading(false));
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Carregando funil de vendas...</span>
        </div>
      </div>
        );
    }

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center h-full min-h-[400px]">
    //     <div className="text-center">
    //       <p className="text-red-500 text-sm font-medium">{error}</p>
    //       <button
    //         onClick={() => window.location.reload()}
    //         className="mt-3 text-sm text-indigo-600 underline hover:text-indigo-800"
    //       >
    //         Tentar novamente
    //       </button>
    //     </div>
    //   </div>
    //     );
    // }

    return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funil de Vendas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {negotiations.length} negociação{negotiations.length !== 1 ? "s" : ""} ativa{negotiations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Board */}
      {negotiations.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-gray-400 text-sm">Nenhuma negociação encontrada.</p>
        </div>
      ) : (
        <KanbanBoard negotiations={negotiations} onUpdate={setNegotiations} />
      )}
    </div>
  );
}