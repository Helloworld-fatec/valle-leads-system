// src/components/profile/EditPasswordForm.tsx
import { useState } from "react";
import { Save, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import type { UserProfile } from "../../services/profileService";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface EditPasswordFormProps {
  profile: UserProfile;
  onUpdatePassword: (password: string) => Promise<void>;
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export default function EditPasswordForm({ profile, onUpdatePassword }: EditPasswordFormProps) {
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  async function handleSave() {
    setError(null);

    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      await onUpdatePassword(newPassword);
      setSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao atualizar senha. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Segurança</h3>
      <p className="text-xs text-gray-400 mb-4">Alterar senha da conta</p>

      {/* Referência visual — somente leitura */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-5">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-700">{profile.name}</span>
          <span className="text-xs text-gray-400">{profile.email}</span>
        </div>
      </div>

      {/* Nova senha */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Nova senha
        </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
          <button
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Confirmar senha */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Confirmar nova senha
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
          <button
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Erro inline */}
      {error && (
        <p className="text-xs text-red-500 mb-3">{error}</p>
      )}

      {/* Botão salvar */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70 ${
          saved
            ? "bg-green-500 text-white shadow-green-200"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
        }`}
      >
        {saved ? (
          <><CheckCircle2 size={15} /> Senha atualizada!</>
        ) : saving ? (
          <><Loader2 size={15} className="animate-spin" /> Salvando...</>
        ) : (
          <><Save size={15} /> Salvar nova senha</>
        )}
      </button>
    </div>
  );
}