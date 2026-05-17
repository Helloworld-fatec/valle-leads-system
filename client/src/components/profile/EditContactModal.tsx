// src/components/profile/EditContactModal.tsx
import { useState } from "react";
import { X, Phone, MapPin, Search, Save, CheckCircle2, Loader2 } from "lucide-react";
import type { UserProfile, UpdateProfileDTO } from "../../services/profileService";

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (userId: string, data: UpdateProfileDTO) => Promise<UserProfile>;
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export default function EditContactModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditContactModalProps) {
  const [form, setForm] = useState({
    phone_1_ddd:          profile.phone_1_ddd          ?? "",
    phone_1_number:       profile.phone_1_number        ?? "",
    phone_2_ddd:          profile.phone_2_ddd          ?? "",
    phone_2_number:       profile.phone_2_number        ?? "",
    address_zip:          profile.address_zip           ?? "",
    address_street:       profile.address_street        ?? "",
    address_number:       profile.address_number        ?? "",
    address_complement:   profile.address_complement    ?? "",
    address_neighborhood: profile.address_neighborhood  ?? "",
    address_city:         profile.address_city          ?? "",
    address_state:        profile.address_state         ?? "",
  });

  const [cepLoading, setCepLoading]   = useState(false);
  const [cepError, setCepError]       = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [dddError, setDddError]       = useState<string | null>(null);

  if (!isOpen) return null;

  // ── Helpers ──────────────────────────────────

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCepSearch() {
    const cep = form.address_zip.replace(/\D/g, "");
    if (cep.length !== 8) {
      setCepError("CEP deve ter 8 dígitos.");
      return;
    }
    setCepError(null);
    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        address_street:       data.logradouro ?? prev.address_street,
        address_neighborhood: data.bairro     ?? prev.address_neighborhood,
        address_city:         data.localidade ?? prev.address_city,
        address_state:        data.uf         ?? prev.address_state,
      }));
    } catch {
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSave() {
    // Valida DDDs
    const ddd1 = form.phone_1_ddd.replace(/\D/g, "");
    const ddd2 = form.phone_2_ddd.replace(/\D/g, "");

    if ((form.phone_1_ddd && ddd1.length !== 2) || (form.phone_2_ddd && ddd2.length !== 2)) {
      setDddError("DDD deve ter exatamente 2 dígitos.");
      return;
    }
    setDddError(null);
    setSaveError(null);
    setSaving(true);

    try {
      await onSave(profile.id, {
        phone_1_ddd:          form.phone_1_ddd          || null,
        phone_1_number:       form.phone_1_number        || null,
        phone_2_ddd:          form.phone_2_ddd          || null,
        phone_2_number:       form.phone_2_number        || null,
        address_zip:          form.address_zip           || null,
        address_street:       form.address_street        || null,
        address_number:       form.address_number        || null,
        address_complement:   form.address_complement    || null,
        address_neighborhood: form.address_neighborhood  || null,
        address_city:         form.address_city          || null,
        address_state:        form.address_state         || null,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setSaveError(err?.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Editar contato e endereço</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* ── Seção Telefones ────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-700">Telefones</p>
            </div>

            {/* Telefone 1 */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">Telefone 1</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={form.phone_1_ddd}
                  onChange={(e) => set("phone_1_ddd", e.target.value.replace(/\D/g, ""))}
                  placeholder="DDD"
                  className="w-16 px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-center"
                />
                <input
                  type="text"
                  value={form.phone_1_number}
                  onChange={(e) => set("phone_1_number", e.target.value)}
                  placeholder="9xxxx-xxxx"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>

            {/* Telefone 2 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Telefone 2 (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={form.phone_2_ddd}
                  onChange={(e) => set("phone_2_ddd", e.target.value.replace(/\D/g, ""))}
                  placeholder="DDD"
                  className="w-16 px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-center"
                />
                <input
                  type="text"
                  value={form.phone_2_number}
                  onChange={(e) => set("phone_2_number", e.target.value)}
                  placeholder="9xxxx-xxxx"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>

            {dddError && (
              <p className="text-xs text-red-500 mt-2">{dddError}</p>
            )}
          </div>

          {/* ── Seção Endereço ─────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-700">Endereço</p>
            </div>

            {/* CEP */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">CEP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={form.address_zip}
                  onChange={(e) => {
                    setCepError(null);
                    set("address_zip", e.target.value);
                  }}
                  placeholder="00000-000"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  onClick={handleCepSearch}
                  disabled={cepLoading}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {cepLoading
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Search size={13} />
                  }
                  Buscar
                </button>
              </div>
              {cepError && (
                <p className="text-xs text-red-500 mt-1.5">{cepError}</p>
              )}
            </div>

            {/* Rua */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">Rua</label>
              <input
                type="text"
                value={form.address_street}
                onChange={(e) => set("address_street", e.target.value)}
                placeholder="Nome da rua"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Número + Complemento */}
            <div className="flex gap-2 mb-3">
              <div className="w-28">
                <label className="block text-xs text-gray-500 mb-1.5">Número</label>
                <input
                  type="text"
                  value={form.address_number}
                  onChange={(e) => set("address_number", e.target.value)}
                  placeholder="Nº"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5">Complemento</label>
                <input
                  type="text"
                  value={form.address_complement}
                  onChange={(e) => set("address_complement", e.target.value)}
                  placeholder="Apto, sala, bloco..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>

            {/* Bairro */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">Bairro</label>
              <input
                type="text"
                value={form.address_neighborhood}
                onChange={(e) => set("address_neighborhood", e.target.value)}
                placeholder="Nome do bairro"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Cidade + Estado */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5">Cidade</label>
                <input
                  type="text"
                  value={form.address_city}
                  onChange={(e) => set("address_city", e.target.value)}
                  placeholder="Nome da cidade"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-500 mb-1.5">Estado</label>
                <select
                  value={form.address_state}
                  onChange={(e) => set("address_state", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700"
                >
                  <option value="">UF</option>
                  {BR_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Erro de salvamento */}
          {saveError && (
            <p className="text-xs text-red-500">{saveError}</p>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70 ${
              saved
                ? "bg-green-500 text-white shadow-green-200"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
            }`}
          >
            {saved ? (
              <><CheckCircle2 size={13} /> Salvo!</>
            ) : saving ? (
              <><Loader2 size={13} className="animate-spin" /> Salvando...</>
            ) : (
              <><Save size={13} /> Salvar alterações</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}