import { useState } from "react";
import { User } from "../../data/mockUsers";
import { Phone, Building2, Save, CheckCircle2 } from "lucide-react";

interface EditProfileFormProps {
  user: User;
}

const departments = [
  "Comercial",
  "Pré-venda",
  "Pós-venda",
  "Suporte",
  "Financeiro",
  "Operações",
  "Marketing",
];

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [form, setForm] = useState({
    phone: user.phone ?? "",
    department: "Comercial",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Editar perfil</h3>

      <div className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Telefone
          </label>
          <div className="relative">
            <Phone
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 9xxxx-xxxx"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Departamento
          </label>
          <div className="relative">
            <Building2
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password section */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-3">Segurança</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nova senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            saved
              ? "bg-green-500 text-white shadow-green-200"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
          }`}
        >
          {saved ? (
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
      </div>
    </div>
  );
}
