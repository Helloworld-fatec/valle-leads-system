// src/components/stores/StoreCard.tsx
import { Store } from "../../services/storesService";

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onToggleActive: (store: Store) => void;
}

export default function StoreCard({ store, onEdit, onToggleActive }: StoreCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
      
      {/* Cabeçalho: nome + badge de status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{store.name}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
            store.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {store.is_active ? "Ativa" : "Inativa"}
        </span>
      </div>

      {/* Endereço */}
      <p className="text-sm text-gray-500">{store.address}</p>

      {/* Botões de ação */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onEdit(store)}
          className="flex-1 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl py-2 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onToggleActive(store)}
          className={`flex-1 text-sm font-medium rounded-xl py-2 transition-colors ${
            store.is_active
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-green-700 bg-green-50 hover:bg-green-100"
          }`}
        >
          {store.is_active ? "Desativar" : "Ativar"}
        </button>
      </div>
    </div>
  );
}