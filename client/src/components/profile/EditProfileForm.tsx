import { useState } from "react";
import { Phone } from "lucide-react";
import { updateName, updatePassword } from "../../services/profileService";

interface Props {
  user: any;
}

export default function EditProfileForm({ user }: Props) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      if (form.name !== user.name) {
        await updateName(form.name);
      }

      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error("As senhas não coincidem");
        }

        await updatePassword(
          form.currentPassword,
          form.newPassword,
          form.confirmPassword
        );
      }

      setSuccess(true);
      setMessage("Alterações salvas com sucesso!");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className="text-sm font-bold mb-4">Editar perfil</h3>

      <div className="space-y-4">

        {/* Nome */}
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />

        {/* Telefone */}
        <div className="relative">
          <Phone className="absolute left-2 top-2 text-gray-400" size={14} />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full pl-8 border p-2 rounded-lg"
          />
        </div>

        {/* Senha */}
        <input
          type="password"
          placeholder="Senha atual"
          className="w-full border p-2 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Nova senha"
          className="w-full border p-2 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Confirmar nova senha"
          className="w-full border p-2 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        {/* Feedback */}
        {message && (
          <p className={`text-sm ${success ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {/* Botão */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}