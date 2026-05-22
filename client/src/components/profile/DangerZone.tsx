// src/components/profile/DangerZone.tsx
import { LogOut, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";

export default function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const { logout } = useAuth();
  const navigate   = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={15} className="text-red-500" />
        <h3 className="text-sm font-bold text-red-700">Zona de perigo</h3>
      </div>

      <div className="space-y-3">
        {/* Sair da sessão */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
          <div>
            <p className="text-xs font-semibold text-red-800">Sair da sessão</p>
            <p className="text-xs text-red-500 mt-0.5">Encerrar acesso ao sistema</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
          >
            <LogOut size={12} />
            Sair
          </button>
        </div>

        {/* Desativar conta */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-700">Desativar conta</p>
            <p className="text-xs text-gray-400 mt-0.5">Requer confirmação do gerente</p>
          </div>
          {confirming ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all">
                Confirmar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
            >
              Solicitar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}