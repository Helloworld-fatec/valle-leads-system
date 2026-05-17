// src/pages/Stores.tsx
import { useEffect, useState } from "react";
import { Store, useStoresService } from "../services/storesService";
import StoreCard from "../components/stores/StoreCard";
import StoreFormModal from "../components/stores/StoreFormModal";

export default function Stores() {
  const { getStores, updateStore } = useStoresService();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [confirmToggle, setConfirmToggle] = useState<Store | null>(null);

  // ─── Busca as lojas ao carregar a página ───
  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStores();
      setStores(data);
    } catch {
      setError("Erro ao carregar lojas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // ─── Abre modal para criar nova loja ───
  const handleNewStore = () => {
    setSelectedStore(null);
    setModalOpen(true);
  };

  // ─── Abre modal para editar loja existente ───
  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setModalOpen(true);
  };

  // ─── Abre confirmação de ativar/desativar ───
  const handleToggleActive = (store: Store) => {
    setConfirmToggle(store);
  };

  // ─── Confirma o toggle após o usuário clicar em confirmar ───
  const handleConfirmToggle = async () => {
    if (!confirmToggle) return;
    try {
      await updateStore(confirmToggle.id, { is_active: !confirmToggle.is_active });
      setConfirmToggle(null);
      fetchStores();
    } catch {
      alert("Erro ao atualizar status da loja.");
      setConfirmToggle(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as lojas da rede Valle</p>
        </div>
        <button
          onClick={handleNewStore}
          className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl px-4 py-2 transition-colors"
        >
          + Nova Loja
        </button>
      </div>

      {/* Estados de loading e erro */}
      {loading && <p className="text-sm text-gray-400">Carregando lojas...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Lista de cards */}
      {!loading && !error && stores.length === 0 && (
        <p className="text-sm text-gray-400">Nenhuma loja cadastrada ainda.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>

      {/* Modal de criar/editar */}
      {modalOpen && (
        <StoreFormModal
          store={selectedStore}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchStores}
        />
      )}

      {/* Modal de confirmação de toggle */}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-gray-900">Confirmar ação</h2>
            <p className="text-sm text-gray-600">
              Deseja realmente{" "}
              <span className="font-semibold">
                {confirmToggle.is_active ? "desativar" : "ativar"}
              </span>{" "}
              a loja <span className="font-semibold">{confirmToggle.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl py-2 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}