import { useState } from "react";
import { Save, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import { useApi } from "../../services/api";
import type { ProfileUser } from "../../pages/Profile";

interface EditProfileFormProps {
  user: ProfileUser;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const { apiFetch } = useApi();
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const res = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao salvar.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    setPasswordError("");
    setPasswordChanged(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Senhas não coincidem.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const res = await apiFetch(`/auth/update-password`, {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        setPasswordChanged(true);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setPasswordChanged(false), 2500);
      } else {
        const data = await res.json();
        setPasswordError(data.message || "Erro ao alterar senha.");
      }
    } catch {
      setPasswordError("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Editar perfil</h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Nome
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome completo"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            saved
              ? "bg-green-500 text-white shadow-green-200"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 disabled:opacity-50"
          }`}
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle2 size={15} />
              Salvo com sucesso!
            </>
          ) : (
            <>
              <Save size={15} />
              Salvar alterações
            </>
          )}
        </button>

        {/* Password section */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-3">Segurança</p>

          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1.5">Senha atual</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1.5">Nova senha</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Password error/success */}
          {passwordError && (
            <p className="text-xs text-red-500 mb-2">{passwordError}</p>
          )}
          {passwordChanged && (
            <p className="text-xs text-green-500 mb-2 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Senha alterada com sucesso!
            </p>
          )}

          <button
            onClick={handlePasswordChange}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-sm shadow-gray-200"
          >
            <Lock size={15} />
            Alterar senha
          </button>
        </div>
      </div>
    </div>
  );
}
