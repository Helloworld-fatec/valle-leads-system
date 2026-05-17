// src/components/stores/StoreFormModal.tsx
import { useEffect, useState } from "react";
import { Store, useStoresService } from "../../services/storesService";

interface StoreFormModalProps {
  store?: Store | null;       // se vier preenchido = editar, se não = criar
  onClose: () => void;        // fecha o modal
  onSuccess: () => void;      // atualiza a lista após salvar
}

export default function StoreFormModal({ store, onClose, onSuccess }: StoreFormModalProps) {
  const { createStore, updateStore } = useStoresService();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se for edição, pré-preenche os campos com os dados atuais
  useEffect(() => {
    if (store) {
      setName(store.name);
      setAddress(store.address);
    }
  }, [store]);

  const handleSave = async () => {
    // Validação: nome é obrigatório
    if (!name.trim()) {
      setError("O nome da loja é obrigatório.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (store) {
        await updateStore(store.id, { name, address });
      } else {
        await createStore({ name, address });
      }
      onSuccess();
      onClose();
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo escuro atrás do modal
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        {/* Título */}
        <h2 className="text-lg font-bold text-gray-900">
          {store ? "Editar Loja" : "Nova Loja"}
        </h2>

        {/* Campo: Nome */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Nome da loja</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Valle Centro"
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Campo: Endereço */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Endereço</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Rua das Flores, 123"
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Mensagem de erro */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Botões */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl py-2 transition-colors"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}