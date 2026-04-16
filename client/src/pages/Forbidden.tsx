import { ShieldOff, ArrowLeft } from "lucide-react";

interface ForbiddenProps {
  onNavigate: (path: string) => void;
}

export default function Forbidden({ onNavigate }: ForbiddenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-2">403</h1>
        <p className="text-lg font-semibold text-gray-700 mb-2">Acesso negado</p>
        <p className="text-sm text-gray-400 mb-8">
          Você não tem permissão para acessar esta página. Entre em contato com seu gerente.
        </p>
        <button
          onClick={() => onNavigate("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-200"
        >
          <ArrowLeft size={15} />
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
