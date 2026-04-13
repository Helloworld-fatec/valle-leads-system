import { useState } from "react";
import { Zap, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");
    if (!form.email || !form.password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Aceita qualquer credencial para demo
      onLogin();
    }, 1200);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0F172A 0%, #1E3A5F 60%, #2563EB 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Valle</p>
            <p className="text-blue-300 text-xs leading-tight">Leads System</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Gerencie seus leads<br />
            <span className="text-blue-300">com inteligência.</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Pipeline completo, funil visual, controle de equipes e métricas em tempo real — tudo em um só lugar.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "1.200+", label: "Leads gerenciados" },
              { value: "98%", label: "Uptime garantido" },
              { value: "3x", label: "Mais conversões" },
            ].map((s) => (
              <div key={s.label} className="bg-white/8 rounded-xl p-4 border border-white/10">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-white/30 text-xs">
          © {new Date().getFullYear()} Valle Leads System. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Valle Leads</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Entrar</h2>
              <p className="text-sm text-gray-500 mt-1">Acesse sua conta para continuar</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="seu@email.com"
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Senha</label>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-3 pr-10 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Entrar
                </>
              )}
            </button>

            {/* Demo hint */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Ambiente de demonstração · qualquer credencial funciona
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
