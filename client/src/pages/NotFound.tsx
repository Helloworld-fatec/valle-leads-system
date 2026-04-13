import { MapPin, ArrowLeft } from "lucide-react";

interface NotFoundProps {
  onNavigate: (path: string) => void;
}

export default function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <MapPin size={28} className="text-blue-500" />
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-lg font-semibold text-gray-700 mb-2">Página não encontrada</p>
        <p className="text-sm text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
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
